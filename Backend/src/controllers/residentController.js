const db = require("../config/db");
const bcrypt = require("bcryptjs");

/* ===============================
   REGISTER RESIDENT
================================ */
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

  db.query(sql, [full_name, email, phone, hashedPassword], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already exists" });
      }
      return res.status(500).json({ message: "Registration failed" });
    }

    res.status(201).json({
      message: "Resident registered successfully"
    });
  });
};


/* ===============================
   BOOK HOUSE
================================ */
exports.bookHouse = (req, res) => {
  const { house_id } = req.body;
  const resident_id = req.user.id;

  const sql = `
    INSERT INTO bookings (house_id, resident_id)
    VALUES (?, ?)
  `;

  db.query(sql, [house_id, resident_id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Booking failed" });
    }

    res.status(201).json({
      message: "House booked successfully"
    });
  });
};


/* ===============================
   GET BOOKINGS
================================ */
exports.getBookings = (req, res) => {
  const resident_id = req.user.id;

  const sql = `
    SELECT bookings.*, houses.title, houses.location
    FROM bookings
    JOIN houses ON bookings.house_id = houses.id
    WHERE bookings.resident_id = ?
    ORDER BY bookings.booking_date DESC
  `;

  db.query(sql, [resident_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch bookings" });
    }

    res.json(results);
  });
};


/* ===============================
   DASHBOARD STATS
================================ */
exports.getResidentStats = (req, res) => {
  const resident_id = req.user.id;

  const sql = `
    SELECT 
      COUNT(*) AS totalBookings
    FROM bookings
    WHERE resident_id = ?
  `;

  db.query(sql, [resident_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch stats" });
    }

    res.json(result[0]);
  });
};