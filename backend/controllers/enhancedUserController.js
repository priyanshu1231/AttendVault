// Enhanced User Controller - Migrated from quick-backend.js
const databaseService = require('../services/databaseService');

// Get all students
const getStudents = async (req, res) => {
  try {
    console.log(`📋 Fetching students list from ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}...`);
    
    const students = await databaseService.getStudents();
    
    console.log(`📋 Found ${students.length} students`);
    console.log('📋 Students in database:', students.map(s => ({ id: s._id, name: s.name, email: s.email })));

    res.json({
      success: true,
      message: `Found ${students.length} students`,
      count: students.length,
      data: students,
      source: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    console.error('❌ Error fetching students:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

// Add new student
const addStudent = async (req, res) => {
  try {
    const { name, email, studentId, department, year, phone } = req.body;

    console.log(`📝 Adding new student (${databaseService.isConnected() ? 'MongoDB' : 'File Storage'}):`, { name, email, studentId, department, year, phone });

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    // Check if student already exists
    const existingStudents = await databaseService.getStudents();
    const existingStudent = existingStudents.find(student => student.email === email.trim().toLowerCase());
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists"
      });
    }

    // Check if student ID already exists
    if (studentId) {
      const existingStudentId = existingStudents.find(student => student.studentId === studentId);
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists"
        });
      }
    }

    // Generate new student ID if not provided
    const newStudentId = studentId || `STU${String(existingStudents.length + 1).padStart(3, '0')}`;

    // Create new student data
    const studentData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      studentId: newStudentId,
      department: department || 'Not Specified',
      year: year || 'Not Specified',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    // Add to database using database service
    const newStudent = await databaseService.addStudent(studentData);

    console.log(`✅ Student added successfully in ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}: ${newStudent.name} (ID: ${newStudent.studentId})`);
    
    // Get updated count
    const allStudents = await databaseService.getStudents();
    console.log(`📊 Total students now: ${allStudents.length}`);

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: newStudent,
      database: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    console.error('❌ Error adding student:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error adding student',
      error: error.message
    });
  }
};

// Dashboard endpoints
const getDashboardStudents = async (req, res) => {
  try {
    console.log(`📋 Dashboard: Fetching all students from ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}...`);
    
    const students = await databaseService.getStudents();
    
    console.log(`📋 Dashboard: Found ${students.length} total students`);
    
    res.json({
      success: true,
      message: `Found ${students.length} total students`,
      count: students.length,
      data: students,
      source: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    console.error('❌ Dashboard error fetching students:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching students for dashboard',
      error: error.message
    });
  }
};

const getPresentToday = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📊 Dashboard: Fetching present students for ${today} from ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}...`);
    
    // Get today's daily attendance records
    const todayAttendance = await databaseService.getDailyAttendance(today);
    
    // Filter for present students
    const presentStudents = todayAttendance.filter(record => record.status === 'Present');
    
    console.log(`📊 Dashboard: Found ${presentStudents.length} students present today`);
    
    res.json({
      success: true,
      message: `Found ${presentStudents.length} students present today`,
      count: presentStudents.length,
      date: today,
      data: presentStudents,
      source: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
    });
  } catch (error) {
    console.error('❌ Dashboard error fetching present students:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching present students for dashboard',
      error: error.message
    });
  }
};

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    console.log(`📊 Dashboard stats request for ${today} (${databaseService.isConnected() ? 'MongoDB' : 'File Storage'})`);

    // Get data from database using database service
    const allStudents = await databaseService.getStudents();
    const todayAttendance = await databaseService.getDailyAttendance(today);
    const allAttendanceRecords = await databaseService.getAttendance();

    console.log(`📊 Today's attendance records from database:`, todayAttendance.length);

    // Calculate statistics from database data
    const totalStudents = allStudents.length;
    const presentToday = todayAttendance.filter(record => record.status === 'Present').length;
    const absentToday = todayAttendance.filter(record => record.status === 'Absent').length;
    const pendingAttendance = allAttendanceRecords.filter(record => record.status === 'Pending').length;
    const pendingLeaveRequests = 0; // Placeholder for leave requests

    // Attendance trends for last 7 days using database data
    const attendanceTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayAttendance = await databaseService.getDailyAttendance(dateKey);

      attendanceTrends.push({
        date: dateKey,
        present: dayAttendance.filter(record => record.status === 'Present').length,
        absent: dayAttendance.filter(record => record.status === 'Absent').length,
        total: dayAttendance.length
      });
    }

    console.log(`📊 Dashboard stats calculated from ${databaseService.isConnected() ? 'MongoDB' : 'file storage'}: ${totalStudents} total, ${presentToday} present, ${absentToday} absent`);

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
        },
        database: databaseService.isConnected() ? 'MongoDB' : 'File Storage'
      }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Database health check
const getDatabaseHealth = async (req, res) => {
  try {
    const health = await databaseService.healthCheck();
    res.json({
      success: true,
      database: health,
      isConnected: databaseService.isConnected(),
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
};

module.exports = {
  getStudents,
  addStudent,
  getDashboardStudents,
  getPresentToday,
  getDashboardStats,
  getDatabaseHealth
};
