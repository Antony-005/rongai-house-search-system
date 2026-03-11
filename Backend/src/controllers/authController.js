const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
exports.register = async (req, res) => {
  const { full_name, email, phone, password, role_id } = req.body;

  if (!full_name || !email || !password || !role_id) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.query(
      `INSERT INTO users (full_name, email, phone, password, role_id) VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, phone, hashedPassword, role_id]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error("register error:", err);
    res.status(500).json({ message: "User registration failed" });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      `SELECT users.*, roles.name AS role
       FROM users
       JOIN roles ON users.role_id = roles.id
       WHERE users.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};