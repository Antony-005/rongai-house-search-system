const db = require("../config/db");

// SEARCH & FILTER HOUSES (RESIDENT)
exports.searchHouses = (req, res) => {
  const { location, minPrice, maxPrice, bedrooms, bathrooms } = req.query;

  let sql = `
    SELECT * FROM houses
    WHERE is_verified = TRUE
    AND status = 'available'
  `;

  const params = [];

  if (location) {
    sql += " AND location LIKE ?";
    params.push(`%${location}%`);
  }

  if (minPrice) {
    sql += " AND price >= ?";
    params.push(minPrice);
  }

  if (maxPrice) {
    sql += " AND price <= ?";
    params.push(maxPrice);
  }

  if (bedrooms) {
    sql += " AND bedrooms = ?";
    params.push(bedrooms);
  }

  if (bathrooms) {
    sql += " AND bathrooms = ?";
    params.push(bathrooms);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Search failed" });
    }
    res.json(results);
  });
};