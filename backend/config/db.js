// 🗄️ Simple Database Connection and Operations
const mongoose = require('mongoose');
const fs = require('fs').promises;

// MongoDB connection
const MONGODB_URL = 'mongodb://localhost:27017/attendance_management';
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

// Simple Schemas
const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  department: String,
  year: String,
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
  type: { type: String, default: 'photo-based' }
});

const DailyAttendanceSchema = new mongoose.Schema({
  date: String,
  studentId: String,
  studentName: String,
  status: String,
  markedBy: String,
  markedAt: { type: Date, default: Date.now }
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

// Database operations
const db = {
  // Check connection status
  isConnected: () => isConnected,

  // Students
  async getStudents() {
    if (isConnected) {
      return await Student.find();
    } else {
      return await readFile('students.json');
    }
  },

  async addStudent(studentData) {
    if (isConnected) {
      const student = new Student(studentData);
      return await student.save();
    } else {
      const students = await readFile('students.json');
      const newStudent = { _id: (students.length + 1).toString(), ...studentData };
      students.push(newStudent);
      await writeFile('students.json', students);
      return newStudent;
    }
  },

  // Attendance (photo-based)
  async getAttendance() {
    if (isConnected) {
      return await Attendance.find().sort({ date: -1 });
    } else {
      return await readFile('attendance-records.json');
    }
  },

  async addAttendance(attendanceData) {
    if (isConnected) {
      const attendance = new Attendance(attendanceData);
      return await attendance.save();
    } else {
      const records = await readFile('attendance-records.json');
      const newRecord = { _id: (records.length + 1).toString(), ...attendanceData };
      records.push(newRecord);
      await writeFile('attendance-records.json', records);
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
      const records = await readFile('attendance-records.json');
      const index = records.findIndex(r => r._id === id);
      if (index !== -1) {
        records[index].status = status;
        records[index].verifiedBy = verifiedBy;
        records[index].verifiedAt = new Date().toISOString();
        await writeFile('attendance-records.json', records);
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
      const records = await readFile('daily-attendance.json');
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
      const records = await readFile('daily-attendance.json');
      const existingIndex = records.findIndex(r => 
        r.date === attendanceData.date && r.studentId === attendanceData.studentId
      );
      
      if (existingIndex !== -1) {
        records[existingIndex] = { ...records[existingIndex], ...attendanceData };
      } else {
        records.push(attendanceData);
      }
      
      await writeFile('daily-attendance.json', records);
      return attendanceData;
    }
  },

  async getAllDailyAttendance() {
    if (isConnected) {
      return await DailyAttendance.find().sort({ date: -1 });
    } else {
      return await readFile('daily-attendance.json');
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

module.exports = { connectDB, db };
