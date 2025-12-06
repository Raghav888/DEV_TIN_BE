const socketio = require('socket.io');
const crypto = require('crypto');
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require('../models/user');
const Chat = require('../models/chat');
const ConnectionRequestModel = require('../models/connectionRequest');

const getHasdedRoomId = (toUserId, fromUserId) => {
    const hash = crypto.createHash('sha256');
    hash.update([toUserId, fromUserId].sort().join("_"));
    return hash.digest('hex');
}


const initilizeSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    // 🔐 AUTH MIDDLEWARE (runs before connection)
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.token;
        console.log("Socket Token:", token);

        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { _id } = decoded;
            // get user details
            const userDetails = await User.findById(_id);
            if (!userDetails) {
                throw new Error("Profile not found")
            }
            socket.user = userDetails;
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {

        socket.on("joinChat", ({ toUserId }) => {
            if (!socket.user) return;
            // should create unique room id for every pair of users, sort is imp as it will always give same id for both users
            const uniqueRoomId = getHasdedRoomId(toUserId, socket.user._id.toString());
            socket.join(uniqueRoomId);
        });

        socket.on("sendMessage", async (data) => {
            try {
                const { toUserId, message } = data;
                const fromUserId = socket.user._id.toString();
                const uniqueRoomId = getHasdedRoomId(toUserId, fromUserId);

                const areBothUsersFriends = await ConnectionRequestModel.findOne({
                    $or: [
                        { requestFromId: toUserId, requestToId: fromUserId, status: "accepted" },
                        { requestFromId: fromUserId, requestToId: toUserId, status: "accepted" },
                    ]
                });

                if (!areBothUsersFriends) {
                    console.error("Users are not connected. Message not sent.");
                    return;
                }

                let chat = await Chat.findOne({
                    members: { $all: [toUserId, socket.user._id] }
                });

                if (!chat) {
                    chat = await new Chat({
                        members: [toUserId, socket.user._id],
                        messages: [],
                    });
                }

                chat.messages.push({
                    sender: socket.user._id,
                    text: message,
                });

                await chat.save();
                io.to(uniqueRoomId).emit("receiveMessage", {
                    message,
                    fromUserId: socket.user._id.toString(),
                    firstName: socket.user.firstName,
                });

            } catch (err) {
                console.error("Error saving message to DB:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected" + socket.id);
        });
    });
}
module.exports = initilizeSocket;