const express = require("express");
const cors = require("cors");
const path = require("path");

// 🗄️ Database Integration
const { connectDB, db } = require('./config/db');

const app = express();

// Demo users for authentication
const demoUsers = {
  'admin@gmail.com': {
    password: 'admin123',
    user: { _id: 'admin-1', name: 'Admin User', email: 'admin@gmail.com', role: 'admin' }
  },
  'student@gmail.com': {
    password: 'student123',
    user: { _id: 'student-1', name: 'Student User', email: 'student@gmail.com', role: 'student' }
  }
};

// Leave requests storage
let leaveRequests = [];

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main route
app.get("/", async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const dbHealth = await db.healthCheck();
  const allStudents = await db.getStudents();
  const todayAttendance = await db.getDailyAttendance(today);

  res.json({
    success: true,
    message: "🎓 Attendance Management System API - CONSOLIDATED",
    status: "running",
    time: new Date().toISOString(),
    database: {
      type: db.isConnected() ? 'MongoDB' : 'File Storage',
      status: dbHealth.status,
      url: db.isConnected() ? 'mongodb://localhost:27017' : 'File System'
    },
    endpoints: {
      auth: "/api/auth/*",
      attendance: "/api/attendance/*",
      users: "/api/users/*",
      dashboard: "/api/dashboard/*"
    },
    data: {
      studentsCount: allStudents.length,
      attendanceRecordsToday: todayAttendance.length,
      database: db.isConnected() ? 'MongoDB' : 'File Storage'
    }
  });
});

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Login attempt: ${email}`);

  const demoUser = demoUsers[email];

  if (demoUser && demoUser.password === password) {
    console.log(`✅ Login successful: ${email} (${demoUser.user.role})`);
    res.json({
      success: true,
      message: 'Login successful',
      data: { token: `persistent-token-${Date.now()}`, user: demoUser.user }
    });
  } else {
    console.log(`❌ Login failed: ${email}`);
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, studentId, department, year, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required"
    });
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { name, email, role }
  });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('🔓 User logged out');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Database Health Check
app.get("/api/db/health", async (req, res) => {
  try {
    const health = await db.healthCheck();
    res.json({
      success: true,
      database: health,
      isConnected: db.isConnected(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      isConnected: false,
      timestamp: new Date().toISOString()
    });
  }
});

// Photo-based attendance submission
app.post("/api/attendance/mark", async (req, res) => {
  try {
    const { latitude, longitude, address, photo, studentId, studentName, datetime } = req.body;

    console.log(`📸 Photo attendance submission received:`, {
      studentName: studentName || 'Unknown',
      studentId: studentId || 'Unknown',
      hasPhoto: !!photo,
      hasLocation: !!(latitude && longitude),
      address: address || 'No address provided'
    });

    if (!latitude || !longitude || !photo || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Location data, photo, and student ID are required"
      });
    }

    const attendanceData = {
      studentId: { name: studentName || 'Student User', email: studentId },
      photo, location: { lat: latitude.toString(), long: longitude.toString() },
      address: address || `${latitude}, ${longitude}`,
      date: datetime || new Date().toISOString(),
      status: 'Pending', submittedAt: new Date().toISOString(), type: 'photo-based'
    };

    const savedRecord = await db.addAttendance(attendanceData);

    res.status(201).json({
      success: true,
      message: "Attendance submitted successfully! Pending admin verification.",
      data: { id: savedRecord._id, status: savedRecord.status, submittedAt: savedRecord.submittedAt }
    });
  } catch (error) {
    console.error('❌ Error processing attendance submission:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while processing attendance submission.",
      error: error.message
    });
  }
});

// Get all attendance records
app.get("/api/attendance/all", async (req, res) => {
  try {
    const records = await db.getAttendance();
    res.json({
      success: true,
      data: records,
      count: records.length,
      source: db.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
});

// Verify attendance with dashboard sync
app.put("/api/attendance/verify/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verifiedBy } = req.body;

    const updatedRecord = await db.updateAttendanceStatus(id, status, verifiedBy || 'Admin');

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    // Sync with daily attendance if approved
    if (status === 'Approved') {
      const dateKey = new Date(updatedRecord.date).toISOString().split('T')[0];
      const dailyAttendanceData = {
        date: dateKey,
        studentId: updatedRecord.studentId.email,
        studentName: updatedRecord.studentId.name,
        status: 'Present',
        markedBy: 'Photo Verification',
        markedAt: new Date().toISOString(),
        type: 'photo-verified',
        attendanceRecordId: id
      };

      await db.markDailyAttendance(dailyAttendanceData);
    }

    res.json({
      success: true,
      message: `Attendance ${status.toLowerCase()} successfully`,
      data: updatedRecord,
      dashboardSynced: status === 'Approved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying attendance',
      error: error.message
    });
  }
});

// Student management routes
app.get("/api/users/students", async (req, res) => {
  try {
    const students = await db.getStudents();
    res.json({
      success: true,
      message: `Found ${students.length} students`,
      count: students.length,
      data: students,
      source: db.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

app.post("/api/users/students", async (req, res) => {
  try {
    const { name, email, studentId, department, year, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const existingStudents = await db.getStudents();
    const existingStudent = existingStudents.find(student => student.email === email.trim().toLowerCase());
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists"
      });
    }

    const newStudentId = studentId || `STU${String(existingStudents.length + 1).padStart(3, '0')}`;
    const studentData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      studentId: newStudentId,
      department: department || 'Not Specified',
      year: year || 'Not Specified',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    const newStudent = await db.addStudent(studentData);

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: newStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding student',
      error: error.message
    });
  }
});

// Daily attendance management
app.post("/api/attendance/daily/mark", async (req, res) => {
  try {
    const { date, studentId, status, markedBy, studentName } = req.body;

    if (!date || !studentId || !status) {
      return res.status(400).json({
        success: false,
        message: "Date, student ID, and status are required"
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Present' or 'Absent'"
      });
    }

    const attendanceData = {
      date: date.split('T')[0],
      studentId,
      studentName: studentName || 'Unknown Student',
      status,
      markedBy: markedBy || 'Admin',
      markedAt: new Date().toISOString()
    };

    const savedRecord = await db.markDailyAttendance(attendanceData);

    res.json({
      success: true,
      message: "Attendance marked successfully",
      data: savedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking attendance",
      error: error.message
    });
  }
});

// Dashboard routes
app.get("/api/users/dashboard/students", async (req, res) => {
  try {
    const students = await db.getStudents();
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students for dashboard',
      error: error.message
    });
  }
});

app.get("/api/users/dashboard/present-today", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await db.getDailyAttendance(today);
    const presentStudents = todayAttendance.filter(record => record.status === 'Present');

    res.json({
      success: true,
      count: presentStudents.length,
      date: today,
      data: presentStudents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching present students',
      error: error.message
    });
  }
});

// Leave Request APIs (simplified)
app.post("/api/leave/request", (req, res) => {
  const { studentId, studentName, reason, startDate, endDate } = req.body;

  if (!reason || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Reason, start date, and end date are required"
    });
  }

  const newRequest = {
    _id: (leaveRequests.length + 1).toString(),
    studentId: studentId || 'student@gmail.com',
    studentName: studentName || 'Student User',
    reason: reason.trim(),
    startDate, endDate,
    status: 'Pending',
    submittedAt: new Date().toISOString()
  };

  leaveRequests.push(newRequest);

  res.status(201).json({
    success: true,
    message: "Leave request submitted successfully",
    data: newRequest
  });
});

app.get("/api/leave/requests", (req, res) => {
  const { studentId, role } = req.query;
  let filteredRequests = leaveRequests;

  if (role !== 'admin' && studentId) {
    filteredRequests = leaveRequests.filter(request => request.studentId === studentId);
  }

  res.json({
    success: true,
    data: filteredRequests
  });
});

app.put("/api/leave/review/:id", (req, res) => {
  const { id } = req.params;
  const { status, reviewedBy } = req.body;

  const requestIndex = leaveRequests.findIndex(request => request._id === id);

  if (requestIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Leave request not found"
    });
  }

  leaveRequests[requestIndex].status = status;
  leaveRequests[requestIndex].reviewedAt = new Date().toISOString();
  leaveRequests[requestIndex].reviewedBy = reviewedBy || 'Admin User';

  res.json({
    success: true,
    message: `Leave request ${status.toLowerCase()} successfully`,
    data: leaveRequests[requestIndex]
  });
});

// Dashboard statistics
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allStudents = await db.getStudents();
    const todayAttendance = await db.getDailyAttendance(today);
    const allAttendanceRecords = await db.getAttendance();

    const totalStudents = allStudents.length;
    const presentToday = todayAttendance.filter(record => record.status === 'Present').length;
    const absentToday = todayAttendance.filter(record => record.status === 'Absent').length;
    const pendingAttendance = allAttendanceRecords.filter(record => record.status === 'Pending').length;
    const pendingLeaveRequests = leaveRequests.filter(request => request.status === 'Pending').length;

    // Attendance trends for last 7 days
    const attendanceTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayAttendance = await db.getDailyAttendance(dateKey);

      attendanceTrends.push({
        date: dateKey,
        present: dayAttendance.filter(record => record.status === 'Present').length,
        absent: dayAttendance.filter(record => record.status === 'Absent').length,
        total: dayAttendance.length
      });
    }

    res.json({
      success: true,
      data: {
        totalStudents,
        presentToday,
        absentToday,
        pendingAttendance,
        pendingLeaveRequests,
        attendanceTrends,
        lastUpdated: new Date().toISOString(),
        todayDate: today,
        attendanceBreakdown: {
          manual: todayAttendance.filter(r => r.type === 'manual' || r.type === 'bulk-manual').length,
          photoVerified: todayAttendance.filter(r => r.type === 'photo-verified').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: {
      main: '/',
      auth: '/api/auth/*',
      attendance: '/api/attendance/*',
      users: '/api/users/*',
      dashboard: '/api/dashboard/*',
      leave: '/api/leave/*'
    }
  });
});

// Start server with database integration
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Consolidated Backend Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🗄️ Database: ${db.isConnected() ? 'MongoDB (localhost:27017)' : 'File Storage'}`);
      console.log(`🏗️ Architecture: Consolidated Single-File Backend`);
      console.log(`👥 Demo credentials:`);
      console.log(`   - Admin: admin@gmail.com / admin123`);
      console.log(`   - Student: student@gmail.com / student123`);
      console.log(`🎯 Ready to receive requests with all features consolidated!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
