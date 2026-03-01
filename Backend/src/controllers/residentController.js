const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.registerResident = (req, res) => {
  const { full_name, email, phone, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      message: "Full name, email, and password are required"
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = `
    INSERT INTO users (full_name, email, phone, password, role_id)
    VALUES (?, ?, ?, ?, 1)
  `;

  db.query(
    sql,
    [full_name, email, phone, hashedPassword],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Registration failed" });
      }

      res.status(201).json({
        message: "Resident registered successfully"
      });
    }
  );
};