const { Server } = require("socket.io");
const { socketAuth } = require("../middleware/socket.middleware");
const groupHandler = require("./handlers/grouphandler");
const chatHandler = require("./handlers/chathandler");
const noteHandler = require("./handlers/notehandler");

function initSocketServer(httpserver) {
  const io = new Server(httpserver);

  //add middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("a user connected", socket.user?.id);

    groupHandler(io, socket);
    chatHandler(io, socket);
    noteHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.user?.id);
    });
  });

  return io;
}

module.exports = initSocketServer;
