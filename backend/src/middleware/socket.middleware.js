const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
  const token = cookies.token; // ✅ reads from cookie header
  
  if (!process.env.JWT_SECRET) {
    return next(new Error("Server config error"));
  }
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
    console.log("Socket auth failed", error.message);
    return next(new Error("Authentication error"));
  }
};
module.exports = { socketAuth };
