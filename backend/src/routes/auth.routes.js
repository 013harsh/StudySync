const router = require("express").Router();
const {
  registerUser,
  loginUser,
  logout,
  updateProfile,
  userdetails,
  deleteUser,
  googleLogin,
} = require("../controller/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/userRegister", registerUser);
router.post("/userLogin", loginUser);
router.post("/googleLogin", googleLogin);
router.post("/userLogout", authMiddleware, logout);
router.get("/userDetails", authMiddleware, userdetails);
router.put("/userUpdateProfile", authMiddleware, updateProfile);
router.delete("/deleteAccount/:id", authMiddleware, deleteUser);
module.exports = router;
