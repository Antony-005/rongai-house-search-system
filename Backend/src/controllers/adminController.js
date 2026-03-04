const db = require("../config/db");

// GET ALL HOUSES (ADMIN VIEW)
exports.getAllHouses = (req, res) => {
  const sql = `
    SELECT houses.*, landlords.full_name AS landlord_name
    FROM houses
    JOIN landlords ON houses.landlord_id = landlords.id
    ORDER BY houses.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch houses" });
    }
    res.json(results);
  });
};

// VERIFY HOUSE
exports.verifyHouse = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE houses
    SET is_verified = TRUE
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Verification failed" });
    }
    res.json({ message: "House verified successfully" });
  });
};

// DEACTIVATE HOUSE
exports.deactivateHouse = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE houses
    SET status = 'inactive'
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to deactivate house" });
    }
    res.json({ message: "House deactivated successfully" });
  });
};