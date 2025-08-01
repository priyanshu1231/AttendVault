// 11. backend/routes/attendanceRoutes.js

const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAllAttendance,
  verifyAttendance,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/mark", protect, markAttendance);
router.get("/all", protect, getAllAttendance);
router.put("/verify/:id", protect, verifyAttendance);

module.exports = router;
