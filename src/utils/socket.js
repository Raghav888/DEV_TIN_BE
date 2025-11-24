const socketio = require('socket.io');

const initilizeSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "http://localhost:5173",
        }
    });

    io.on("connection", (socket) => {

        socket.on("joinChat", ({ toUserId, fromUserId }) => {
            // should create unique room id for every pair of users, sort is imp as it will always give same id for both users
            const uniqueRoomId = [toUserId, fromUserId].sort().join("_");
            console.log("Joining room: " + uniqueRoomId);
            socket.join(uniqueRoomId);
        });

        socket.on("sendMessage", (data) => {
            const { toUserId, fromUserId, message, firstName } = data;
            const uniqueRoomId = [toUserId, fromUserId].sort().join("_");
            console.log("Joining room: " + uniqueRoomId);
            io.to(uniqueRoomId).emit("receiveMessage", {
                message,
                fromUserId,
                firstName
            });
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected" + socket.id);
        });
    });
}
module.exports = initilizeSocket;