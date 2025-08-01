// Enhanced Database Service - Migrated from quick-backend.js
const mongoose = require('mongoose');
const fs = require('fs').promises;

// MongoDB connection
const MONGODB_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_management';
let isConnected = false;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    isConnected = true;
    console.log('✅ MongoDB connected: localhost:27017/attendance_management');
    return true;
  } catch (error) {
    isConnected = false;
    console.log('📁 MongoDB not available, using file storage');
    return false;
  }
};

// Enhanced Schemas
const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  department: String,
  year: String,
  phone: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    name: String,
    email: String
  },
  photo: String,
  location: {
    lat: String,
    long: String
  },
  address: String,
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  submittedAt: { type: Date, default: Date.now },
  type: { type: String, default: 'photo-based' },
  verifiedBy: String,
  verifiedAt: Date
});

const DailyAttendanceSchema = new mongoose.Schema({
  date: String,
  studentId: String,
  studentName: String,
  status: String,
  markedBy: String,
  markedAt: { type: Date, default: Date.now },
  type: String,
  attendanceRecordId: String
});

// Models
const Student = mongoose.model('Student', StudentSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const DailyAttendance = mongoose.model('DailyAttendance', DailyAttendanceSchema);

// File fallback functions
const readFile = async (filename) => {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeFile = async (filename, data) => {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    return false;
  }
};

// Database operations service
const databaseService = {
  // Connection status
  isConnected: () => isConnected,
  connectDB,

  // Students
  async getStudents() {
    if (isConnected) {
      return await Student.find();
    } else {
      return await readFile('data/students.json');
    }
  },

  async addStudent(studentData) {
    if (isConnected) {
      const student = new Student(studentData);
      return await student.save();
    } else {
      const students = await readFile('data/students.json');
      const newStudent = { _id: (students.length + 1).toString(), ...studentData };
      students.push(newStudent);
      await writeFile('data/students.json', students);
      return newStudent;
    }
  },

  // Attendance (photo-based)
  async getAttendance() {
    if (isConnected) {
      return await Attendance.find().sort({ date: -1 });
    } else {
      return await readFile('data/attendance.json');
    }
  },

  async addAttendance(attendanceData) {
    if (isConnected) {
      const attendance = new Attendance(attendanceData);
      return await attendance.save();
    } else {
      const records = await readFile('data/attendance.json');
      const newRecord = { _id: (records.length + 1).toString(), ...attendanceData };
      records.push(newRecord);
      await writeFile('data/attendance.json', records);
      return newRecord;
    }
  },

  async updateAttendanceStatus(id, status, verifiedBy) {
    if (isConnected) {
      return await Attendance.findByIdAndUpdate(id, {
        status,
        verifiedBy,
        verifiedAt: new Date()
      }, { new: true });
    } else {
      const records = await readFile('data/attendance.json');
      const index = records.findIndex(r => r._id === id);
      if (index !== -1) {
        records[index].status = status;
        records[index].verifiedBy = verifiedBy;
        records[index].verifiedAt = new Date().toISOString();
        await writeFile('data/attendance.json', records);
        return records[index];
      }
      return null;
    }
  },

  // Daily Attendance (QuickAttendance)
  async getDailyAttendance(date) {
    if (isConnected) {
      return await DailyAttendance.find({ date });
    } else {
      const records = await readFile('data/daily-attendance.json');
      return records.filter(r => r.date === date);
    }
  },

  async markDailyAttendance(attendanceData) {
    if (isConnected) {
      return await DailyAttendance.findOneAndUpdate(
        { date: attendanceData.date, studentId: attendanceData.studentId },
        attendanceData,
        { upsert: true, new: true }
      );
    } else {
      const records = await readFile('data/daily-attendance.json');
      const existingIndex = records.findIndex(r => 
        r.date === attendanceData.date && r.studentId === attendanceData.studentId
      );
      
      if (existingIndex !== -1) {
        records[existingIndex] = { ...records[existingIndex], ...attendanceData };
      } else {
        records.push(attendanceData);
      }
      
      await writeFile('data/daily-attendance.json', records);
      return attendanceData;
    }
  },

  async getAllDailyAttendance() {
    if (isConnected) {
      return await DailyAttendance.find().sort({ date: -1 });
    } else {
      return await readFile('data/daily-attendance.json');
    }
  },

  // Health check
  async healthCheck() {
    if (isConnected) {
      try {
        await mongoose.connection.db.admin().ping();
        return {
          status: 'connected',
          database: 'attendance_management',
          url: MONGODB_URL
        };
      } catch (error) {
        return { status: 'error', error: error.message };
      }
    } else {
      return {
        status: 'file_storage',
        message: 'Using file-based storage'
      };
    }
  }
};

module.exports = databaseService;
