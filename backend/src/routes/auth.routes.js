const router = require("express").Router();
const {
  registerUser,
  loginUser,
  logout,
  updateProfile,
  getMe,
  deleteUser,
} = require("../controller/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logout);
router.put("/profile", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getMe);
router.delete("/delete/:id", authMiddleware, deleteUser);
module.exports = router;
