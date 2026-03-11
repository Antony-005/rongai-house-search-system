const db = require("../config/db");

// ─── HELPER ──────────────────────────────────────────────────────────────────
// Gets the agent record id for the currently logged-in user
const getAgentId = async (userId) => {
  const [rows] = await db.query(
    "SELECT id FROM agents WHERE user_id = ?",
    [userId]
  );
  if (rows.length === 0) throw new Error("AGENT_NOT_FOUND");
  return rows[0].id;
};

// ─── LANDLORD MANAGEMENT ─────────────────────────────────────────────────────

// POST /api/agent/landlords
exports.addLandlord = async (req, res) => {
  const { full_name, phone, email } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ message: "Full name and phone are required." });
  }

  try {
    const agentId = await getAgentId(req.user.id);

    const [result] = await db.query(
      "INSERT INTO landlords (full_name, phone, email, agent_id) VALUES (?, ?, ?, ?)",
      [full_name, phone, email || null, agentId]
    );

    res.status(201).json({
      message: "Landlord registered successfully.",
      landlordId: result.insertId,
    });
  } catch (err) {
    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(403).json({ message: "Agent profile not found." });
    }
    console.error("addLandlord error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/agent/landlords
exports.getMyLandlords = async (req, res) => {
  try {
    const agentId = await getAgentId(req.user.id);

    const [landlords] = await db.query(
      "SELECT * FROM landlords WHERE agent_id = ? ORDER BY created_at DESC",
      [agentId]
    );

    res.status(200).json({ landlords });
  } catch (err) {
    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(403).json({ message: "Agent profile not found." });
    }
    console.error("getMyLandlords error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── HOUSE MANAGEMENT ────────────────────────────────────────────────────────

// POST /api/agent/houses
exports.addHouse = async (req, res) => {
  const { landlord_id, title, location, price, bedrooms, bathrooms, description } = req.body;

  if (!landlord_id || !title || !location || !price) {
    return res.status(400).json({ message: "Landlord, title, location, and price are required." });
  }

  try {
    const agentId = await getAgentId(req.user.id);

    // Verify this landlord belongs to this agent
    const [landlordCheck] = await db.query(
      "SELECT id FROM landlords WHERE id = ? AND agent_id = ?",
      [landlord_id, agentId]
    );

    if (landlordCheck.length === 0) {
      return res.status(403).json({ message: "This landlord does not belong to you." });
    }

    const [result] = await db.query(
      `INSERT INTO houses (landlord_id, title, location, price, bedrooms, bathrooms, description, status, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'available', FALSE)`,
      [landlord_id, title, location, price, bedrooms || null, bathrooms || null, description || null]
    );

    res.status(201).json({
      message: "House listing added. Awaiting admin verification.",
      houseId: result.insertId,
    });
  } catch (err) {
    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(403).json({ message: "Agent profile not found." });
    }
    console.error("addHouse error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/agent/houses
exports.getMyHouses = async (req, res) => {
  try {
    const agentId = await getAgentId(req.user.id);

    const [houses] = await db.query(
      `SELECT h.*, l.full_name AS landlord_name
       FROM houses h
       JOIN landlords l ON h.landlord_id = l.id
       WHERE l.agent_id = ?
       ORDER BY h.created_at DESC`,
      [agentId]
    );

    res.status(200).json({ houses });
  } catch (err) {
    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(403).json({ message: "Agent profile not found." });
    }
    console.error("getMyHouses error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/agent/houses/:id
exports.updateHouse = async (req, res) => {
  const houseId = req.params.id;
  const { title, location, price, bedrooms, bathrooms, description } = req.body;

  try {
    const agentId = await getAgentId(req.user.id);

    const [ownerCheck] = await db.query(
      `SELECT h.id FROM houses h
       JOIN landlords l ON h.landlord_id = l.id
       WHERE h.id = ? AND l.agent_id = ?`,
      [houseId, agentId]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({ message: "You do not own this listing." });
    }

    await db.query(
      `UPDATE houses
       SET title=?, location=?, price=?, bedrooms=?, bathrooms=?, description=?, is_verified=FALSE
       WHERE id=?`,
      [title, location, price, bedrooms || null, bathrooms || null, description || null, houseId]
    );

    res.status(200).json({ message: "House updated. Re-verification required." });
  } catch (err) {
    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(403).json({ message: "Agent profile not found." });
    }
    console.error("updateHouse error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// PATCH /api/agent/houses/:id/deactivate
exports.deactivateHouse = async (req, res) => {
  const houseId = req.params.id;

  try {
    const agentId = await getAgentId(req.user.id);

    const [ownerCheck] = await db.query(
      `SELECT h.id FROM houses h
       JOIN landlords l ON h.landlord_id = l.id
       WHERE h.id = ? AND l.agent_id = ?`,
      [houseId, agentId]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({ message: "You do not own this listing." });
    }

    await db.query(
      "UPDATE houses SET status = 'inactive' WHERE id = ?",
      [houseId]
    );

    res.status(200).json({ message: "House deactivated successfully." });
  } catch (err) {
    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(403).json({ message: "Agent profile not found." });
    }
    console.error("deactivateHouse error:", err);
    res.status(500).json({ message: "Server error." });
  }
};