// Enhanced User Routes - Migrated from quick-backend.js
const express = require('express');
const router = express.Router();
const {
  getStudents,
  addStudent,
  getDashboardStudents,
  getPresentToday,
  getDashboardStats,
  getDatabaseHealth
} = require('../controllers/enhancedUserController');

// Student management routes
router.get('/students', getStudents);
router.post('/students', addStudent);

// Dashboard routes
router.get('/dashboard/students', getDashboardStudents);
router.get('/dashboard/present-today', getPresentToday);
router.get('/dashboard/stats', getDashboardStats);

// Database health
router.get('/db/health', getDatabaseHealth);

module.exports = router;
