// 7. backend/controllers/userController.js

const User = require("../models/User");

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching students", error });
  }
};
