const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        // read cookies
        const cookies = req.cookies;
        const { token } = cookies;
        if (!token) {
            return res.status(401).send("Please login");
        }
        // decode token
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        // it will return same value that we sent as first param while creating token
        // in our case it will {_id:...}
        const { _id } = decoded;
        // get user details
        const userDetails = await User.findById(_id);
        if (!userDetails) {
            throw new Error("Profile not found")
        }
        // attaching userDetails to req, so that next middlerware will have access to it.
        req.user = userDetails;
        next();
    } catch (err) {
        res.status(400).send("Not able to auth: " + err.message);
    }
}

module.exports = { userAuth }