const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

  if (!cookies.token) {
    return next(new Error("Authentication error"));
  }
  try {
    //verify token
    const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }

  console.log(cookies);
};
module.exports = { socketAuth };
