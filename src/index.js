const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.on("join", (options = {}, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", generateMessage("Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (!user) return callback({ error: "Not joined" });

    if (filter.isProfane(msg)) return callback("Profanity is not allowed!");

    io.to(user.room).emit("message", generateMessage(msg, user.username));
    callback();
  });

  socket.on("sendLocation", ({ latitude, longitude } = {}, callback) => {
    const user = getUser(socket.id);

    if (!user) return callback({ error: "Not joined" });

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, { latitude, longitude })
    );
    callback();
  });

  socket.on("disconnect", (msg) => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
