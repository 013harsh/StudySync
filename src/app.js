const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const groupRoutes = require("./routes/group.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);

module.exports = app;
