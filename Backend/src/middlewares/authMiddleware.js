const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Verifies JWT token from Authorization header
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, full_name, email }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Role-based access control
// Usage: requireRole("admin") or requireRole("agent")
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };