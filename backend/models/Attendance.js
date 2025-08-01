// 9. backend/models/Attendance.js

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  location: {
    lat: String,
    long: String,
  },
  address: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Present", "Absent"],
    default: "Pending",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Attendance", attendanceSchema);
