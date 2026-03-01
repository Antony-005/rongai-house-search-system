const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
exports.register = (req, res) => {
  const { full_name, email, phone, password, role_id } = req.body;

  if (!full_name || !email || !password || !role_id) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = `
    INSERT INTO users (full_name, email, phone, password, role_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [full_name, email, phone, hashedPassword, role_id], (err) => {
    if (err) {
      return res.status(500).json({ message: "User registration failed", error: err });
    }
    res.status(201).json({ message: "User registered successfully" });
  });
};

// LOGIN USER
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT users.*, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE email = ?
  `;

  db.query(sql, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result[0];

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });
  });
};