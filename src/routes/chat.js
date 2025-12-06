const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const { userAuth } = require('../middlewares/auth');


// Endpoint to fetch chat history between two users
router.get('/chat/:toUserId', userAuth, async (req, res) => {
    const fromUserId = req.user._id.toString();
    const toUserId = req.params.toUserId;
    try {
        let chat = await Chat.findOne({
            members: { $all: [fromUserId, toUserId] }
        }).populate({
            path: 'messages.sender',
            select: 'firstName'
        })


        if (!chat) {
            return res.status(200).json({ messages: [] });
        }

        res.status(200).json({ messages: chat.messages });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;