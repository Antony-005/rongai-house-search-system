const db = require("../config/db");
const bcrypt = require("bcryptjs");

/* ===============================
   REGISTER RESIDENT
================================ */
exports.registerResident = async (req, res) => {
  const { full_name, email, phone, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required" });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.query(
      `INSERT INTO users (full_name, email, phone, password, role_id) VALUES (?, ?, ?, ?, 1)`,
      [full_name, email, phone, hashedPassword]
    );

    res.status(201).json({ message: "Resident registered successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error("registerResident error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ===============================
   BOOK HOUSE
================================ */
exports.createBooking = async (req, res) => {
  const residentId = req.user.id;
  const { house_id, notes } = req.body;

  if (!house_id) {
    return res.status(400).json({ message: "House ID is required." });
  }

  try {
    // Confirm house exists, is verified and available
    const [houseRows] = await db.query(
      `SELECT id, status, is_verified FROM houses WHERE id = ?`,
      [house_id]
    );

    if (houseRows.length === 0) {
      return res.status(404).json({ message: "House not found." });
    }

    const house = houseRows[0];

    if (!house.is_verified) {
      return res.status(400).json({ message: "This house has not been verified yet." });
    }

    if (house.status !== "available") {
      return res.status(400).json({ message: "This house is not available for booking." });
    }

    // Prevent duplicate active bookings
    const [existing] = await db.query(
      `SELECT id FROM bookings
       WHERE house_id = ? AND resident_id = ? AND status IN ('pending', 'approved')`,
      [house_id, residentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "You already have an active booking for this house." });
    }

    const [result] = await db.query(
      `INSERT INTO bookings (house_id, resident_id, notes, status) VALUES (?, ?, ?, 'pending')`,
      [house_id, residentId, notes || null]
    );

    res.status(201).json({
      message: "Booking submitted successfully! Awaiting admin approval.",
      bookingId: result.insertId,
    });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ===============================
   GET MY BOOKINGS
================================ */
exports.getMyBookings = async (req, res) => {
  const residentId = req.user.id;

  try {
    const [bookings] = await db.query(
      `SELECT b.id, b.status, b.booking_date, b.notes,
              h.id AS house_id, h.title AS house_title,
              h.location, h.price, h.bedrooms, h.bathrooms
       FROM bookings b
       JOIN houses h ON b.house_id = h.id
       WHERE b.resident_id = ?
       ORDER BY b.booking_date DESC`,
      [residentId]
    );

    res.status(200).json({ bookings });
  } catch (err) {
    console.error("getMyBookings error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ===============================
   DASHBOARD STATS
================================ */
exports.getResidentStats = async (req, res) => {
  const residentId = req.user.id;

  try {
    const [result] = await db.query(
      `SELECT COUNT(*) AS totalBookings FROM bookings WHERE resident_id = ?`,
      [residentId]
    );

    res.json(result[0]);
  } catch (err) {
    console.error("getResidentStats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};