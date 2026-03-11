const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const residentRoutes = require("./routes/residentRoutes");
const agentRoutes = require("./routes/agentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const houseRoutes = require("./routes/houseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Auth (register + login for all roles)
app.use("/api/auth", authRoutes);

// Role-specific routes
app.use("/api/resident", residentRoutes);   // was /api/residents — now singular to match frontend
app.use("/api/agent", agentRoutes);
app.use("/api/admin", adminRoutes);

// Public house listings
app.use("/api/houses", houseRoutes);

app.get("/", (req, res) => {
  res.send("Rongai House Search API is running");
});

module.exports = app;