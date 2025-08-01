// 6. backend/controllers/attendanceController.js

const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
  try {
    const { latitude, longitude, address, photo } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!latitude || !longitude || !photo) {
      return res.status(400).json({ message: "Latitude, longitude, and photo are required" });
    }

    // Check if attendance already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      studentId: userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked today" });
    }

    const attendance = await Attendance.create({
      studentId: userId,
      photo,
      location: {
        lat: latitude,
        long: longitude
      },
      address: address || `${latitude}, ${longitude}`,
      date: new Date(),
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate("studentId", "name email")
      .sort({ date: -1 }); // Sort by newest first

    return res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      data: data
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching attendance",
      error: error.message
    });
  }
};

exports.verifyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['Present', 'Absent', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Present, Absent, Approved, or Rejected"
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      {
        status,
        verifiedAt: new Date(),
        verifiedBy: req.user._id
      },
      { new: true }
    ).populate("studentId", "name email");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Attendance ${status.toLowerCase()} successfully`,
      data: attendance
    });
  } catch (error) {
    console.error("Error verifying attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying attendance",
      error: error.message
    });
  }
};


