const db = require("../config/db");

// Get all houses
exports.getAllHouses = (req, res) => {
  const sql = `
    SELECT h.*, v.verified, v.verified_at, u.full_name AS landlord_name
    FROM houses h
    LEFT JOIN verifications v ON h.id = v.house_id
    LEFT JOIN landlords l ON h.landlord_id = l.id
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY h.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch houses" });
    res.json(results || []);
  });
};

// Verify a house
exports.verifyHouse = (req, res) => {
  const adminId = req.user.id; // From verifyToken middleware
  const houseId = req.params.houseId;

  const sqlCheck = `SELECT * FROM verifications WHERE house_id = ?`;
  db.query(sqlCheck, [houseId], (err, results) => {
    if (err) return res.status(500).json({ message: "Verification failed" });

    if (results.length > 0) {
      // Update existing verification
      const sqlUpdate = `UPDATE verifications SET verified = TRUE, verified_at = NOW(), admin_id = ? WHERE house_id = ?`;
      db.query(sqlUpdate, [adminId, houseId], (err2) => {
        if (err2) return res.status(500).json({ message: "Failed to update verification" });
        res.json({ message: "House verified successfully" });
      });
    } else {
      // Insert new verification
      const sqlInsert = `INSERT INTO verifications (house_id, admin_id, verified, verified_at) VALUES (?, ?, TRUE, NOW())`;
      db.query(sqlInsert, [houseId, adminId], (err2) => {
        if (err2) return res.status(500).json({ message: "Failed to insert verification" });
        res.json({ message: "House verified successfully" });
      });
    }
  });
};

// Get all users
exports.getAllUsers = (req, res) => {
  const sql = `
    SELECT u.id, u.full_name, u.email, r.name AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch users" });
    res.json(results || []);
  });
};