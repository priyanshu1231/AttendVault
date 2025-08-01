// User routes
const express = require('express');
const router = express.Router();
const { getAllStudents } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleCheck');

// Get all students (admin only)
router.get('/students', protect, checkRole('admin'), getAllStudents);

module.exports = router;
