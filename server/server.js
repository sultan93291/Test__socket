const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const {config:configDotenv}= require("dotenv")

const app = express();
app.use(express.json());
const server = createServer(app);
configDotenv()

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});



app.get("/", (req, res) => {
  res.send(`<h1> hello world</h1>`);
});

io.on("connection", socket => {
  console.log(`user connected: ${socket.id}`);
  socket.on("message", ({ message, room }) => {
    if (!room) {
      // io.to(room).emit("received-message", message);
      socket.broadcast.emit("received-message", message);
    } else {
      socket.to(room).emit("received-message", message);
    }
    console.log(room);
  });

  socket.on("Create_room", room => {
    socket.join(room);
  });
});

app.post("/post", (req, res) => {
  const { message, room } = req.body;
  console.log(message);

  try {
    if (room) {
      io.to(room).emit("received-message", message);
    } else {
      io.emit("received-message", message);
    }
    res.send("success").status(200);
    console.log(room);
  } catch (error) {
    res.send(error).status(400);
  }
});

server.listen( process.env.PORT, () => {
  console.log(`listening on : http://localhost:${process.env.PORT}`);
});
