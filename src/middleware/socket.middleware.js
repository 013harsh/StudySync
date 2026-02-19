const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
  const authHeader = socket.handshake.headers?.authorization;

  // Try cookie first, then Authorization header
  const token = cookies.token || authHeader;

  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log("Socket auth successful for user:", decoded.id);
    next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }

};
module.exports = { socketAuth };
