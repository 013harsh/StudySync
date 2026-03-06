const router = require("express").Router();
const {
  registerUser,
  loginUser,
  logout,
  updateProfile,
} = require("../controller/auth.controller");
const {authMiddleware} = require("../middleware/auth.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
