const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const residentRoutes = require("./routes/residentRoutes");
const agentRoutes = require("./routes/agentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const houseRoutes = require("./routes/houseRoutes");

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

// Auth (register + login for all roles)
app.use("/api/auth", authRoutes);

// Role-specific routes
app.use("/api/resident", residentRoutes);   
app.use("/api/agent", agentRoutes);
app.use("/api/admin", adminRoutes);

// Public house listings
app.use("/api/houses", houseRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/", (req, res) => {
  res.send("Rongai House Search API is running");
});

module.exports = app;