// Photo model placeholder
const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  // Photo schema placeholder for location/photo-based attendance
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    required: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', photoSchema);
