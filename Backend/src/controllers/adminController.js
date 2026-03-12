const db = require("../config/db");

// ─── HOUSE MANAGEMENT ────────────────────────────────────────────────────────

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

exports.verifyHouse = async (req, res) => {
  const houseId = req.params.id;
  try {
    const [houseRows] = await db.query("SELECT id, is_verified FROM houses WHERE id = ?", [houseId]);
    if (houseRows.length === 0) return res.status(404).json({ message: "House not found." });
    if (houseRows[0].is_verified) return res.status(400).json({ message: "House is already verified." });
    await db.query("UPDATE houses SET is_verified = TRUE WHERE id = ?", [houseId]);
    res.status(200).json({ message: "House verified and is now publicly listed." });
  } catch (err) {
    console.error("verifyHouse error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.rejectHouse = async (req, res) => {
  const houseId = req.params.id;
  try {
    const [houseRows] = await db.query("SELECT id FROM houses WHERE id = ?", [houseId]);
    if (houseRows.length === 0) return res.status(404).json({ message: "House not found." });
    await db.query("UPDATE houses SET status = 'inactive', is_verified = FALSE WHERE id = ?", [houseId]);
    res.status(200).json({ message: "House rejected and deactivated." });
  } catch (err) {
    console.error("rejectHouse error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── AGENT MANAGEMENT ────────────────────────────────────────────────────────

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

exports.updateBookingStatus = async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'approved' or 'rejected'." });
  }
  try {
    const [bookingRows] = await db.query(
      "SELECT id, status, house_id FROM bookings WHERE id = ?", [bookingId]
    );
    if (bookingRows.length === 0) return res.status(404).json({ message: "Booking not found." });
    if (bookingRows[0].status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be updated." });
    }
    await db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, bookingId]);
    if (status === "approved") {
      await db.query("UPDATE houses SET status = 'booked' WHERE id = ?", [bookingRows[0].house_id]);
    }
    res.status(200).json({ message: `Booking ${status} successfully.` });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── PAYMENT MANAGEMENT ──────────────────────────────────────────────────────

exports.getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.id, p.amount, p.description, p.payment_date,
              l.full_name AS landlord_name, l.phone AS landlord_phone,
              u.full_name AS agent_name, u.email AS agent_email
       FROM payments p
       JOIN landlords l ON p.landlord_id = l.id
       JOIN agents a ON p.agent_id = a.id
       JOIN users u ON a.user_id = u.id
       ORDER BY p.payment_date DESC`
    );
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    res.status(200).json({ payments, total });
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getPaymentsSummaryByAgent = async (req, res) => {
  try {
    const [summary] = await db.query(
      `SELECT u.full_name AS agent_name, u.email AS agent_email,
              COUNT(p.id) AS total_payments,
              COALESCE(SUM(p.amount), 0) AS total_collected,
              MAX(p.payment_date) AS last_payment_date
       FROM agents a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN payments p ON p.agent_id = a.id
       GROUP BY a.id, u.full_name, u.email
       ORDER BY total_collected DESC`
    );
    res.status(200).json({ summary });
  } catch (err) {
    console.error("getPaymentsSummaryByAgent error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────

// GET /api/admin/reports/overview
// Single endpoint — all key system metrics in one call
exports.getReportOverview = async (req, res) => {
  try {
    const [[userStats]]    = await db.query(`SELECT COUNT(*) AS total_users FROM users`);
    const [[residentStats]]= await db.query(`SELECT COUNT(*) AS total_residents FROM users WHERE role_id = 1`);
    const [[agentStats]]   = await db.query(`SELECT COUNT(*) AS total_agents FROM agents`);
    const [[landlordStats]]= await db.query(`SELECT COUNT(*) AS total_landlords FROM landlords`);

    const [[houseStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_houses,
        SUM(is_verified = TRUE AND status = 'available') AS available,
        SUM(status = 'booked')   AS booked,
        SUM(status = 'inactive') AS inactive,
        SUM(is_verified = FALSE AND status != 'inactive') AS pending_verification
      FROM houses
    `);

    const [[bookingStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_bookings,
        SUM(status = 'pending')  AS pending,
        SUM(status = 'approved') AS approved,
        SUM(status = 'rejected') AS rejected
      FROM bookings
    `);

    const [[paymentStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_payments,
        COALESCE(SUM(amount), 0) AS total_collected
      FROM payments
    `);

    res.status(200).json({
      users: {
        total:     userStats.total_users,
        residents: residentStats.total_residents,
        agents:    agentStats.total_agents,
        landlords: landlordStats.total_landlords,
      },
      houses: {
        total:                houseStats.total_houses,
        available:            houseStats.available,
        booked:               houseStats.booked,
        inactive:             houseStats.inactive,
        pending_verification: houseStats.pending_verification,
      },
      bookings: {
        total:    bookingStats.total_bookings,
        pending:  bookingStats.pending,
        approved: bookingStats.approved,
        rejected: bookingStats.rejected,
      },
      payments: {
        total_records:   paymentStats.total_payments,
        total_collected: Number(paymentStats.total_collected),
      },
    });
  } catch (err) {
    console.error("getReportOverview error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/admin/reports/houses
// Listing performance — status breakdown + top locations + listing activity over time
exports.getHousesReport = async (req, res) => {
  try {
    // Status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT
        status,
        is_verified,
        COUNT(*) AS count
      FROM houses
      GROUP BY status, is_verified
      ORDER BY count DESC
    `);

    // Top locations by number of listings
    const [topLocations] = await db.query(`
      SELECT location, COUNT(*) AS count
      FROM houses
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `);

    // Price range distribution
    const [priceRanges] = await db.query(`
      SELECT
        CASE
          WHEN price < 5000  THEN 'Under 5K'
          WHEN price < 10000 THEN '5K - 10K'
          WHEN price < 20000 THEN '10K - 20K'
          WHEN price < 40000 THEN '20K - 40K'
          ELSE 'Above 40K'
        END AS price_range,
        COUNT(*) AS count
      FROM houses
      GROUP BY price_range
      ORDER BY MIN(price)
    `);

    // Listings added per month (last 6 months)
    const [listingsOverTime] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM houses
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    // Bedroom distribution
    const [bedroomDist] = await db.query(`
      SELECT
        COALESCE(bedrooms, 0) AS bedrooms,
        COUNT(*) AS count
      FROM houses
      GROUP BY bedrooms
      ORDER BY bedrooms ASC
    `);

    res.status(200).json({
      statusBreakdown,
      topLocations,
      priceRanges,
      listingsOverTime,
      bedroomDist,
    });
  } catch (err) {
    console.error("getHousesReport error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/admin/reports/bookings
// Booking activity — status distribution + monthly trend + top booked houses
exports.getBookingsReport = async (req, res) => {
  try {
    // Status distribution
    const [statusDist] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM bookings
      GROUP BY status
    `);

    // Bookings per month (last 6 months)
    const [bookingsOverTime] = await db.query(`
      SELECT
        DATE_FORMAT(booking_date, '%Y-%m') AS month,
        COUNT(*) AS total,
        SUM(status = 'approved') AS approved,
        SUM(status = 'rejected') AS rejected,
        SUM(status = 'pending')  AS pending
      FROM bookings
      WHERE booking_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    // Most booked houses
    const [topHouses] = await db.query(`
      SELECT h.title, h.location, h.price,
             COUNT(b.id) AS total_bookings,
             SUM(b.status = 'approved') AS approved_bookings
      FROM bookings b
      JOIN houses h ON b.house_id = h.id
      GROUP BY h.id, h.title, h.location, h.price
      ORDER BY total_bookings DESC
      LIMIT 10
    `);

    // Most active residents (by bookings)
    const [topResidents] = await db.query(`
      SELECT u.full_name, u.email, u.phone,
             COUNT(b.id) AS total_bookings
      FROM bookings b
      JOIN users u ON b.resident_id = u.id
      GROUP BY u.id, u.full_name, u.email, u.phone
      ORDER BY total_bookings DESC
      LIMIT 10
    `);

    res.status(200).json({
      statusDist,
      bookingsOverTime,
      topHouses,
      topResidents,
    });
  } catch (err) {
    console.error("getBookingsReport error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/admin/reports/agents
// Agent performance — landlords recruited, listings added, payments collected
exports.getAgentsReport = async (req, res) => {
  try {
    const [agentPerformance] = await db.query(`
      SELECT
        u.full_name AS agent_name,
        u.email,
        u.phone,
        a.assigned_area,
        a.created_at AS joined_date,
        COUNT(DISTINCT l.id)  AS total_landlords,
        COUNT(DISTINCT h.id)  AS total_listings,
        SUM(h.is_verified = TRUE AND h.status = 'available') AS active_listings,
        SUM(h.status = 'booked')   AS booked_listings,
        SUM(h.status = 'inactive') AS inactive_listings,
        COUNT(DISTINCT p.id)  AS total_payments,
        COALESCE(SUM(p.amount), 0) AS total_collected
      FROM agents a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN landlords l  ON l.agent_id  = a.id
      LEFT JOIN houses h     ON h.landlord_id = l.id
      LEFT JOIN payments p   ON p.agent_id  = a.id
      GROUP BY a.id, u.full_name, u.email, u.phone, a.assigned_area, a.created_at
      ORDER BY total_collected DESC
    `);

    // Landlords recruited per month (last 6 months)
    const [recruitmentOverTime] = await db.query(`
      SELECT
        DATE_FORMAT(l.created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM landlords l
      WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    res.status(200).json({ agentPerformance, recruitmentOverTime });
  } catch (err) {
    console.error("getAgentsReport error:", err);
    res.status(500).json({ message: "Server error." });
  }
};