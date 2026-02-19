const { Server } = require("socket.io");
const { socketAuth } = require("../middleware/socket.middleware");

function initSocketServer(httpserver) {
  const io = new Server(httpserver);

  //add middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    console.log("User ID:", socket.user.id);

    socket.on("message", (data) => {
      console.log("message received", data);

      //send meassage back client
      socket.emit("reply", "Hello client 👋");
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  return io;
}

module.exports = initSocketServer;
