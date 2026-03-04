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

app.use("/api/auth", authRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/houses", houseRoutes);

app.get("/", (req, res) => {
  res.send("Rongai House Search API is running");
});

module.exports = app;