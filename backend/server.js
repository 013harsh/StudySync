require("dotenv").config();
const path = require("path");

const app = require("./src/app");
const httpserver = require("http").createServer(app);

const initSocketServer = require("./src/sockets/socket.server");
const connectDB = require("./src/db/db");

connectDB();
initSocketServer(httpserver);

// serve frontend
app.use(require("express").static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

httpserver.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
