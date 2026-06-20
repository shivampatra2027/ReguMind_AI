const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  req.user = {
    userId: "507f1f77bcf86cd799439011",
    email: "demo@regumind.ai",
    role: "Compliance Officer",
  };

  next();
};

module.exports = authMiddleware;