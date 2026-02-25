const router = require("express").Router();
const {
  createGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
} = require("../controller/group.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/create", authMiddleware, createGroup);
router.post("/join", authMiddleware, joinGroup);
router.delete("/delete/:id", authMiddleware, deleteGroup);
router.put("/leave/:id", authMiddleware, leaveGroup);

module.exports = router;
