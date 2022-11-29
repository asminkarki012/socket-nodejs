// alogrithm
// 1. broadcast msg when user joins the chat or leaves the chat
// 2. broadcast msg when user send it
// 3.

const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const server = http.createServer(app);
const io = socketio(server);
// serve static files
app.use(express.static(path.join(__dirname, "public")));
const botName = "Chat Bot";

// run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //welcome current user
    socket.emit("message", formatMessage(botName, `Welcome to chat ${user.username}`));

    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    // listen for chatMessage
    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
      //emit to everyone
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
  });
  //broadcast when a user disconnects
  socket.on("disconnect", () => {
    // everyone knows
    const user = userLeave(socket.id);
    if (user) {
      io.emit(
        "message",
        formatMessage(botName, `${user.username} have left the chat`)
      );

      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
