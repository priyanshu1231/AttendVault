// 10. backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { register, login, getProfile, verifyToken, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.get("/verify-token", protect, verifyToken);
router.post("/logout", protect, logout);

module.exports = router;
