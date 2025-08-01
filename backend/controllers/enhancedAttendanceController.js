// Enhanced Attendance Controller - Migrated from quick-backend.js
const databaseService = require('../services/databaseService');

// Photo-Based Attendance Submission
const markAttendance = async (req, res) => {
  try {
    const { latitude, longitude, address, photo, studentId, studentName, datetime } = req.body;
    
    console.log(`📸 Photo attendance submission received (${databaseService.isConnected() ? 'MongoDB' : 'File Storage'}):`, {
      studentName: studentName || 'Unknown',
      studentId: studentId || 'Unknown',
      hasPhoto: !!photo,
      hasLocation: !!(latitude && longitude),
      address: address || 'No address provided',
      timestamp: new Date().toISOString()
    });
    
    // Enhanced validation
    if (!latitude || !longitude) {
      console.error('❌ Missing location data');
      return res.status(400).json({
        success: false,
        message: "Location data (latitude and longitude) is required for attendance submission"
      });
    }

    if (!photo) {
      console.error('❌ Missing photo data');
      return res.status(400).json({
        success: false,
        message: "Photo is required for attendance submission"
      });
    }

    if (!studentId) {
      console.error('❌ Missing student ID');
      return res.status(400).json({
        success: false,
        message: "Student ID is required for attendance submission"
      });
    }

    // Create attendance record with enhanced data structure
    const attendanceData = {
      studentId: {
        name: studentName || 'Student User',
        email: studentId
      },
      photo: photo,
      location: {
        lat: parseFloat(latitude).toString(),
        long: parseFloat(longitude).toString()
      },
      address: address || `${latitude}, ${longitude}`,
      date: datetime || new Date().toISOString(),
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      type: 'photo-based'
    };

    // Save using database service
    const savedRecord = await databaseService.addAttendance(attendanceData);

    console.log(`✅ Photo attendance recorded successfully in ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}:`, {
      id: savedRecord._id,
      student: savedRecord.studentId.name,
      email: savedRecord.studentId.email,
      location: `${savedRecord.location.lat}, ${savedRecord.location.long}`,
      database: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: "Attendance submitted successfully! Your submission is pending admin verification.",
      data: {
        id: savedRecord._id,
        status: savedRecord.status,
        submittedAt: savedRecord.submittedAt,
        message: "Your attendance has been recorded and will be verified by an administrator.",
        database: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
      }
    });

  } catch (error) {
    console.error('❌ Error processing photo attendance submission:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while processing attendance submission. Please try again.",
      error: error.message
    });
  }
};

// Get all attendance records
const getAllAttendance = async (req, res) => {
  try {
    console.log(`📋 Fetching attendance records from ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}...`);
    
    const records = await databaseService.getAttendance();
    
    console.log(`📋 Found ${records.length} attendance records`);
    
    res.json({
      success: true,
      data: records,
      count: records.length,
      source: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    console.error('❌ Error fetching attendance records:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
};

// Verify attendance with dashboard sync
const verifyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verifiedBy } = req.body;

    console.log(`🔍 Verifying attendance ${id} as ${status} (${databaseService.isConnected() ? 'MongoDB' : 'File Storage'})`);

    // Update attendance record using database service
    const updatedRecord = await databaseService.updateAttendanceStatus(id, status, verifiedBy || 'Admin');

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    // Also update daily attendance if approved - CRITICAL FOR DASHBOARD SYNC
    if (status === 'Approved') {
      const dateKey = new Date(updatedRecord.date).toISOString().split('T')[0];
      const studentEmail = updatedRecord.studentId.email;
      const studentName = updatedRecord.studentId.name;

      console.log(`📊 Marking student as Present in daily attendance: ${studentName} (${studentEmail}) for ${dateKey}`);

      // Create daily attendance record
      const dailyAttendanceData = {
        date: dateKey,
        studentId: studentEmail,
        studentName: studentName,
        status: 'Present',
        markedBy: 'Photo Verification',
        markedAt: new Date().toISOString(),
        type: 'photo-verified',
        attendanceRecordId: id
      };

      // Save to daily attendance using database service
      await databaseService.markDailyAttendance(dailyAttendanceData);

      console.log(`✅ Dashboard sync complete: ${studentName} marked as Present for ${dateKey}`);
    }

    console.log(`✅ Attendance ${id} ${status.toLowerCase()} successfully`);

    res.json({
      success: true,
      message: `Attendance ${status.toLowerCase()} successfully`,
      data: updatedRecord,
      dashboardSynced: status === 'Approved',
      database: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    console.error('❌ Error verifying attendance:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error verifying attendance',
      error: error.message
    });
  }
};

// Daily Attendance Management (QuickAttendance)
const markDailyAttendance = async (req, res) => {
  try {
    const { date, studentId, status, markedBy } = req.body;

    console.log(`📝 QuickAttendance marking request received (${databaseService.isConnected() ? 'MongoDB' : 'File Storage'}):`, {
      date,
      studentId,
      status,
      markedBy,
      body: req.body
    });

    // Validate required fields
    if (!date || !studentId || !status) {
      console.error('❌ Missing required fields for attendance marking');
      return res.status(400).json({
        success: false,
        message: "Date, student ID, and status are required",
        received: { date: !!date, studentId: !!studentId, status: !!status }
      });
    }

    // Validate status
    if (!['Present', 'Absent'].includes(status)) {
      console.error('❌ Invalid status value:', status);
      return res.status(400).json({
        success: false,
        message: "Status must be 'Present' or 'Absent'",
        received: status
      });
    }

    const dateKey = date.split('T')[0]; // Get YYYY-MM-DD format

    // Create attendance data
    const attendanceData = {
      date: dateKey,
      studentId: studentId,
      studentName: req.body.studentName || 'Unknown Student',
      status: status,
      markedBy: markedBy || 'Admin',
      markedAt: new Date().toISOString()
    };

    // Save using database service
    const savedRecord = await databaseService.markDailyAttendance(attendanceData);

    console.log(`✅ QuickAttendance marked successfully in ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}:`, {
      date: dateKey,
      studentId,
      status,
      markedBy: markedBy || 'Admin'
    });

    res.json({
      success: true,
      message: `Attendance marked as ${status} for ${dateKey}`,
      data: savedRecord,
      database: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });

  } catch (error) {
    console.error('❌ Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: "Error marking attendance",
      error: error.message
    });
  }
};

module.exports = {
  markAttendance,
  getAllAttendance,
  verifyAttendance,
  markDailyAttendance
};
