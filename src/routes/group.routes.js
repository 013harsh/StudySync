const router = require("express").Router();
const { createGroup } = require("../controller/group.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/create", authMiddleware, createGroup);


module.exports = router;