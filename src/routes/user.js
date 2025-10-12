const express = require("express")
const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const router = express.Router();

// return all user from db
router.get('/feed', userAuth, async (req, res) => {
    try {
        // get all data from User collection
        const feeds = await User.find({});
        res.status(200).send(feeds)
    } catch (err) {
        res.status(500).send("Error while retriving all data" + err.message)
    }
})

module.exports = router