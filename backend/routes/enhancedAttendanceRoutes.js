// Enhanced Attendance Routes - Migrated from quick-backend.js
const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAllAttendance,
  verifyAttendance,
  markDailyAttendance
} = require('../controllers/enhancedAttendanceController');

// Photo-based attendance routes
router.post('/mark', markAttendance);
router.get('/all', getAllAttendance);
router.put('/verify/:id', verifyAttendance);

// Daily attendance routes (QuickAttendance)
router.post('/daily/mark', markDailyAttendance);

module.exports = router;
