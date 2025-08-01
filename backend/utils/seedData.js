// backend/utils/seedData.js
// Seed script to create demo users for testing

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: 'admin'
    });

    // Create student users
    const studentPassword = await bcrypt.hash('student123', 10);
    const student1 = await User.create({
      name: 'John Doe',
      email: 'student@gmail.com',
      password: studentPassword,
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@gmail.com',
      password: studentPassword,
      role: 'student'
    });

    const student3 = await User.create({
      name: 'Mike Johnson',
      email: 'mike@gmail.com',
      password: studentPassword,
      role: 'student'
    });

    console.log('✅ Demo users created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('👨‍💼 Admin: admin@gmail.com / admin123');
    console.log('🎓 Student: student@gmail.com / student123');
    console.log('🎓 Student: jane@gmail.com / student123');
    console.log('🎓 Student: mike@gmail.com / student123');

    // Create some sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Attendance.create([
      {
        studentId: student1._id,
        photo: 'sample-photo-1.jpg',
        location: { lat: '40.7128', long: '-74.0060' },
        date: today,
        status: 'Pending'
      },
      {
        studentId: student2._id,
        photo: 'sample-photo-2.jpg',
        location: { lat: '40.7589', long: '-73.9851' },
        date: yesterday,
        status: 'Present'
      },
      {
        studentId: student3._id,
        photo: 'sample-photo-3.jpg',
        location: { lat: '40.7505', long: '-73.9934' },
        date: yesterday,
        status: 'Present'
      }
    ]);

    console.log('✅ Sample attendance records created!');
    console.log('\n🚀 Your attendance management system is ready!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
