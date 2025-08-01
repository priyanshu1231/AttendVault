// 3. backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, secret);

      // Find user and ensure they still exist
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists"
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Token has expired"
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Not authorized"
        });
      }
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "No token provided"
    });
  }
};

// Optional middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }
};

// Optional middleware to check if user is student
const requireStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Student access required"
    });
  }
};

module.exports = { protect, requireAdmin, requireStudent };
