const jwt = require("jsonwebtoken");

// VERIFY TOKEN
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded; // attach user info from token
    next();
  });
};

// ROLE CHECK: Admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// ROLE CHECK: Agent
const isAgent = (req, res, next) => {
  if (!req.user || req.user.role !== "agent") {
    return res.status(403).json({ message: "Agent access required" });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isAgent
};