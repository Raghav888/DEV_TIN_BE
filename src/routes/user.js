const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { USER_SAFE_DATA } = require("./constants");
const router = express.Router();


router.get("/requests/received", userAuth, async (req, res) => {
    try {
        const id = req.user._id;
        // .populate takes first param as fieldName from ConnectionRequest which has ref, so it will take data from its ref schema
        // and second param takes array which has fields name that needs to picked up from the other schema
        const connectionRequests = await ConnectionRequest.find({
            requestToId: id,
            status: "interested",
        }).populate("requestFromId", USER_SAFE_DATA);


        res.status(200).json({ data: connectionRequests });
    } catch (error) {
        res.status(500).send("Failed to get requests " + error);
    }
});

router.get("/connections", userAuth, async (req, res) => {
    try {
        const id = req.user._id;
        const connections = await ConnectionRequest.find({
            $or: [
                { requestFromId: id, status: "accepted" },
                { requestToId: id, status: "accepted" },
            ],
        })
            .populate("requestFromId", USER_SAFE_DATA) // if we get only requestFromId then we wont see profile of other users to
            // whom curr user has sent the connection. so we need to get requestToId to populate as well
            .populate("requestToId", USER_SAFE_DATA);
        // and when requestFromId is curr user Id, then we need to get data of requestToId  and in vice versa to get requestFromId
        const data = connections.map((connection) =>
            connection.requestFromId.equals(id)
                ? connection.requestToId
                : connection.requestFromId
        );

        res.status(200).json({ message: "connection", data });
    } catch (error) {
        res.status(500).send("Failed to get connections " + error);
    }
});

// /feed?page=1&limit=10
// return all user from db - IMP API
router.get("/feed", userAuth, async (req, res) => {
    try {
        // user should see all users cards excepts
        // 1. his own card
        // 2. his connections
        // 3. igbored people
        // 4. already send connection
        // basically all user which are in connectionRequestDB should be avoided from feed
        const id = req.user._id;
        // find all connection requests (sent + recevied)
        const connectionRequests = await ConnectionRequest.find({
            $or: [{ requestFromId: id }, { requestToId: id }],
        }).select(["requestFromId", "requestToId"]); // it selects only those field from doc

        const connectedIds = new Set();

        connectionRequests.forEach((req) => {
            connectedIds.add(req.requestFromId.toString());
            connectedIds.add(req.requestToId.toString());
        });

        // get query values and convert to number as they are string
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (limit > 20) {
            return res.status(400).json({ message: "Wrong query values" })
        }
        // get all data from User collection where any user id is not equal to any user id from connectionIds.
        // and also curr user profile should not be there so _id not equal to curr user id
        const feeds = await User.find({ _id: { $nin: [...connectedIds, id] } })
            .skip((page - 1) * limit) // skip initial n records
            .limit(limit) // return n to limit records only
            .select(USER_SAFE_DATA);

        res.status(200).json({ message: "feeds", data: feeds });
    } catch (err) {
        res.status(500).send("Error while retriving all data" + err.message);
    }
});

module.exports = router;


// when filtering, sorting, pagination -> use query
// when entity finding, or find resource like id, etc -> use param