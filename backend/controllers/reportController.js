// 9. backend/controllers/reportController.js

const Attendance = require("../models/Attendance");
const User = require("../models/User");

// Generate attendance report for specific user
exports.generateReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Attendance.find({ userId })
      .populate("userId", "name email")
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      data: records
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate comprehensive attendance reports
exports.getComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Attendance.find(query)
      .populate("userId", "name email role department")
      .sort({ date: -1 });

    // Filter by department if specified
    const filteredRecords = department 
      ? records.filter(record => record.userId.department === department)
      : records;

    res.status(200).json({
      success: true,
      data: filteredRecords,
      summary: {
        totalRecords: filteredRecords.length,
        presentCount: filteredRecords.filter(r => r.status === 'present').length,
        absentCount: filteredRecords.filter(r => r.status === 'absent').length,
        pendingCount: filteredRecords.filter(r => r.status === 'pending').length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
