const express = require("express");
const { userAuth } = require('../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionRequest')
const User = require('../models/user')
const router = express.Router()

router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const status = req.params.status;
        const requestToId = req.params.toUserId;
        const requestFromId = req.user._id;

        // api level validation for status value
        if (!["interested", "ignored"].includes(status)) {
            return res.status(400).send("invalid status")
        }
        // api level validation if connection request already exist
        const doRequestExist = await ConnectionRequestModel.findOne({
            $or: [{ requestToId, requestFromId }, { requestToId: requestFromId, requestFromId: requestToId }]
        })

        if (doRequestExist) {
            return res.status(200).json({ message: "Request already exist" })
        }
        // api level validation for touser exist or not
        const isUserExist = await User.findById(requestToId);
        if (!isUserExist) {
            return res.status(404).json({ message: "user doesnot exist" })
        }

        const request = new ConnectionRequestModel({ requestToId, requestFromId, status })
        const data = await request.save();
        res.status(200).json(data)
    } catch (error) {
        res.status(500).send("Failed to send request " + error)
    }
})

module.exports = router;