// io.js — Singleton to share the socket.io instance across the app
let _io = null;

const setIO = (io) => {
  _io = io;
};
const getIO = () => {
  if (!_io) throw new Error("Socket.io not initialized yet");
  return _io;
};

module.exports = { setIO, getIO };
