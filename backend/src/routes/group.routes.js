const router = require("express").Router();
const {
  createGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getMyGroups,
} = require("../controller/group.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/create", authMiddleware, createGroup);
router.post("/join", authMiddleware, joinGroup);
router.get("/my-groups", authMiddleware, getMyGroups);
router.get("/groupmember/:id", authMiddleware, getGroupMembers);
router.delete("/deletegroup/:id", authMiddleware, deleteGroup);
router.put("/leave/:id", authMiddleware, leaveGroup);

module.exports = router;
