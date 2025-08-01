// Leave routes placeholder
const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Leave routes placeholder
router.post('/apply', leaveController.applyLeave);
router.get('/', leaveController.getLeaveRequests);
router.put('/:id/status', leaveController.updateLeaveStatus);

module.exports = router;
