const db = require("../config/db");
const bcrypt = require("bcrypt");

const saltRounds = 10;

/* ===========================
   ADMIN REGISTERS AGENT
=========================== */
exports.registerAgent = async (req, res) => {
  try {
    const { full_name, email, phone, password, assigned_area } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required"
      });
    }

    // Check if email already exists
    const [existing] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Role id for agent (assuming 2 = agent)
    const roleId = 2;

    // Insert into users table
    const [userResult] = await db.promise().query(
      "INSERT INTO users (full_name,email,phone,password,role_id) VALUES (?,?,?,?,?)",
      [full_name, email, phone, hashedPassword, roleId]
    );

    const userId = userResult.insertId;

    // Insert into agents table
    await db.promise().query(
      "INSERT INTO agents (user_id,assigned_area) VALUES (?,?)",
      [userId, assigned_area || null]
    );

    res.status(201).json({
      message: "Agent registered successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Agent registration failed"
    });
  }
};


/* ===========================
   AGENT GET THEIR HOUSES
=========================== */
exports.getAgentHouses = (req, res) => {

  const agentId = req.user.id;

  const sql = `
  SELECT h.*
  FROM houses h
  JOIN agents a ON h.agent_id = a.id
  WHERE a.user_id = ?
  ORDER BY h.created_at DESC
  `;

  db.query(sql, [agentId], (err, results) => {

    if (err) {
      return res.status(500).json({
        message: "Failed to fetch agent houses"
      });
    }

    res.json(results || []);

  });

};


/* ===========================
   AGENT GET BOOKINGS
=========================== */
exports.getAgentBookings = (req, res) => {

  const agentId = req.user.id;

  const sql = `
  SELECT b.*, h.title, h.location
  FROM bookings b
  JOIN houses h ON b.house_id = h.id
  JOIN agents a ON h.agent_id = a.id
  WHERE a.user_id = ?
  ORDER BY b.created_at DESC
  `;

  db.query(sql, [agentId], (err, results) => {

    if (err) {
      return res.status(500).json({
        message: "Failed to fetch bookings"
      });
    }

    res.json(results || []);

  });

};