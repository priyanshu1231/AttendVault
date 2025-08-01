// 4. backend/middleware/roleCheck.js

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Access is denied" });
    }
  };
};

module.exports = checkRole;
