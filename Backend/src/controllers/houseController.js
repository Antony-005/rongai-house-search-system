const db = require("../config/db");

// GET /api/houses
// Public: verified + available houses with optional search & filters
// Query params: search, location, minPrice, maxPrice, bedrooms
exports.getAllHouses = async (req, res) => {
  try {
    const { search, location, minPrice, maxPrice, bedrooms } = req.query;

    let query = `
      SELECT h.id, h.title, h.location, h.price, h.bedrooms, h.bathrooms,
             h.description, h.status, h.created_at,
             l.full_name AS landlord_name
      FROM houses h
      JOIN landlords l ON h.landlord_id = l.id
      WHERE h.is_verified = TRUE AND h.status = 'available'
    `;

    const params = [];

    if (search) {
      query += ` AND (h.title LIKE ? OR h.location LIKE ? OR h.description LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (location) {
      query += ` AND h.location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (minPrice) {
      query += ` AND h.price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND h.price <= ?`;
      params.push(Number(maxPrice));
    }

    if (bedrooms) {
      query += ` AND h.bedrooms = ?`;
      params.push(Number(bedrooms));
    }

    query += ` ORDER BY h.created_at DESC`;

    const [houses] = await db.query(query, params);
    res.status(200).json({ houses });
  } catch (err) {
    console.error("getAllHouses error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/houses/:id
// Public: single verified house detail
exports.getHouseById = async (req, res) => {
  const houseId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT h.*, l.full_name AS landlord_name, l.phone AS landlord_phone
       FROM houses h
       JOIN landlords l ON h.landlord_id = l.id
       WHERE h.id = ? AND h.is_verified = TRUE`,
      [houseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "House not found." });
    }

    res.status(200).json({ house: rows[0] });
  } catch (err) {
    console.error("getHouseById error:", err);
    res.status(500).json({ message: "Server error." });
  }
};