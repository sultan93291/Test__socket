const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const users = {}; // userId => socket.id

io.on("connection", socket => {
  console.log(`New connection: ${socket.id}`);

  socket.on("register", userId => {
    users[userId] = socket.id;
    console.log(`${userId} registered with ${socket.id}`);
  });

  socket.on("join-room", room => {
    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
  });

  socket.on("private-message", ({ toUserId, fromUserId, message }) => {
    const toSocketId = users[toUserId];
    if (toSocketId) {
      io.to(toSocketId).emit("received-message", {
        message,
        from: fromUserId,
        type: "private",
      });
    }
  });

  socket.on("room-message", ({ room, fromUserId, message }) => {
    io.to(room).emit("received-message", {
      message,
      from: fromUserId,
      type: "room",
      room,
    });
  });

  socket.on("disconnect", () => {
    for (const id in users) {
      if (users[id] === socket.id) {
        delete users[id];
        break;
      }
    }
    console.log(`Disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
