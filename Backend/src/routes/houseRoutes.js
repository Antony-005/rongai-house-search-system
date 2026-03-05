const express = require("express");
const router = express.Router();
const houseController = require("../controllers/houseController");
const { verifyToken } = require("../middlewares/authMiddleware");

// SEARCH & FILTER HOUSES (public)
router.get("/search", houseController.searchHouses);

// Protected routes if needed in future, e.g. adding houses (agent/admin only)

module.exports = router;