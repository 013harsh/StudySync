const { Server } = require("socket.io");
const { socketAuth } = require("../middleware/socket.middleware");
const groupHandler = require("./handlers/group.handler");
const chatHandler = require("./handlers/chat.handler");
const noteHandler = require("./handlers/notes.handler");
const webrtcHandler = require("./handlers/webrtc.handler");
const studyRoomHandler = require("./handlers/studyRoom.handler");
const { setIO } = require("./io");

function initSocketServer(httpserver) {
  const io = new Server(httpserver, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
    transports: ["polling", "websocket"],
    upgrade: true,
  });
  setIO(io); // register singleton for use in controllers

  //add middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("a user connected", socket.user?.id);

    groupHandler(io, socket);
    chatHandler(io, socket);
    noteHandler(io, socket);
    webrtcHandler(io, socket);
    studyRoomHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.user?.id);
    });
  });

  return io;
}

module.exports = initSocketServer;
