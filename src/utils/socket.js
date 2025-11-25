const socketio = require('socket.io');
const crypto = require('crypto');
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require('../models/user');

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
            // should create unique room id for every pair of users, sort is imp as it will always give same id for both users
            const uniqueRoomId = getHasdedRoomId(toUserId, socket.user._id.toString());
            socket.join(uniqueRoomId);
        });

        socket.on("sendMessage", (data) => {
            const { toUserId, message } = data;
            const uniqueRoomId = getHasdedRoomId(toUserId, socket.user._id.toString());
            io.to(uniqueRoomId).emit("receiveMessage", {
                message,
                fromUserId: socket.user._id.toString(),
                firstName: socket.user.firstName,
            });
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected" + socket.id);
        });
    });
}
module.exports = initilizeSocket;