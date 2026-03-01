const db = require("../config/db");

// ADD LANDLORD
exports.addLandlord = (req, res) => {
  const { full_name, phone, email } = req.body;
  const agent_id = req.user.id;

  const sql = `
    INSERT INTO landlords (full_name, phone, email, agent_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [full_name, phone, email, agent_id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to add landlord" });
    res.status(201).json({ message: "Landlord added successfully" });
  });
};

// ADD HOUSE
exports.addHouse = (req, res) => {
  const { landlord_id, title, location, price, bedrooms, bathrooms, description } = req.body;

  const sql = `
    INSERT INTO houses 
    (landlord_id, title, location, price, bedrooms, bathrooms, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [landlord_id, title, location, price, bedrooms, bathrooms, description], (err) => {
    if (err) return res.status(500).json({ message: "Failed to add house" });
    res.status(201).json({ message: "House added successfully" });
  });
};