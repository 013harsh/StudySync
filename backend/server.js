require("dotenv").config();

const app = require("./src/app");
const httpserver = require("http").createServer(app);

const initSocketServer = require("./src/sockets/socket.server");

const connectDB = require("./src/db/db");
connectDB();

initSocketServer(httpserver);

// httpserver.listen(3000, () => console.log("server on port 3000"));
httpserver.listen(3000, () => {
  console.log("Server running on port 3000");
});
