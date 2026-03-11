const db = require("../config/db");

// ─── HOUSE MANAGEMENT ────────────────────────────────────────────────────────

// GET /api/admin/houses/pending
exports.getPendingVerifications = async (req, res) => {
  try {
    const [houses] = await db.query(
      `SELECT h.id, h.title, h.location, h.price, h.bedrooms, h.bathrooms,
              h.description, h.status, h.is_verified, h.created_at,
              l.full_name AS landlord_name, l.phone AS landlord_phone,
              u.full_name AS agent_name
       FROM houses h
       JOIN landlords l ON h.landlord_id = l.id
       JOIN agents a ON l.agent_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE h.is_verified = FALSE AND h.status != 'inactive'
       ORDER BY h.created_at DESC`
    );

    res.status(200).json({ houses });
  } catch (err) {
    console.error("getPendingVerifications error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/admin/houses
exports.getAllHousesAdmin = async (req, res) => {
  try {
    const [houses] = await db.query(
      `SELECT h.id, h.title, h.location, h.price, h.bedrooms, h.bathrooms,
              h.status, h.is_verified, h.created_at,
              l.full_name AS landlord_name,
              u.full_name AS agent_name
       FROM houses h
       JOIN landlords l ON h.landlord_id = l.id
       JOIN agents a ON l.agent_id = a.id
       JOIN users u ON a.user_id = u.id
       ORDER BY h.created_at DESC`
    );

    res.status(200).json({ houses });
  } catch (err) {
    console.error("getAllHousesAdmin error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// PATCH /api/admin/houses/:id/verify
exports.verifyHouse = async (req, res) => {
  const houseId = req.params.id;

  try {
    const [houseRows] = await db.query(
      "SELECT id, is_verified FROM houses WHERE id = ?",
      [houseId]
    );

    if (houseRows.length === 0) {
      return res.status(404).json({ message: "House not found." });
    }

    if (houseRows[0].is_verified) {
      return res.status(400).json({ message: "House is already verified." });
    }

    await db.query(
      "UPDATE houses SET is_verified = TRUE WHERE id = ?",
      [houseId]
    );

    res.status(200).json({ message: "House verified and is now publicly listed." });
  } catch (err) {
    console.error("verifyHouse error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// PATCH /api/admin/houses/:id/reject
exports.rejectHouse = async (req, res) => {
  const houseId = req.params.id;

  try {
    const [houseRows] = await db.query(
      "SELECT id FROM houses WHERE id = ?",
      [houseId]
    );

    if (houseRows.length === 0) {
      return res.status(404).json({ message: "House not found." });
    }

    await db.query(
      "UPDATE houses SET status = 'inactive', is_verified = FALSE WHERE id = ?",
      [houseId]
    );

    res.status(200).json({ message: "House rejected and deactivated." });
  } catch (err) {
    console.error("rejectHouse error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── AGENT MANAGEMENT ────────────────────────────────────────────────────────

// GET /api/admin/agents
exports.getAllAgents = async (req, res) => {
  try {
    const [agents] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, a.assigned_area, a.created_at,
              COUNT(DISTINCT l.id) AS total_landlords,
              COUNT(DISTINCT h.id) AS total_houses
       FROM agents a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN landlords l ON l.agent_id = a.id
       LEFT JOIN houses h ON h.landlord_id = l.id
       GROUP BY a.id, u.id, u.full_name, u.email, u.phone, a.assigned_area, a.created_at
       ORDER BY a.created_at DESC`
    );

    res.status(200).json({ agents });
  } catch (err) {
    console.error("getAllAgents error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── BOOKING MANAGEMENT ──────────────────────────────────────────────────────

// GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.id, b.status, b.booking_date, b.notes,
              h.title AS house_title, h.location, h.price,
              u.full_name AS resident_name, u.email AS resident_email, u.phone AS resident_phone
       FROM bookings b
       JOIN houses h ON b.house_id = h.id
       JOIN users u ON b.resident_id = u.id
       ORDER BY b.booking_date DESC`
    );

    res.status(200).json({ bookings });
  } catch (err) {
    console.error("getAllBookings error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// PATCH /api/admin/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'approved' or 'rejected'." });
  }

  try {
    const [bookingRows] = await db.query(
      "SELECT id, status, house_id FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (bookingRows.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (bookingRows[0].status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be updated." });
    }

    await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, bookingId]
    );

    // If approved, mark the house as booked
    if (status === "approved") {
      await db.query(
        "UPDATE houses SET status = 'booked' WHERE id = ?",
        [bookingRows[0].house_id]
      );
    }

    res.status(200).json({ message: `Booking ${status} successfully.` });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ message: "Server error." });
  }
};