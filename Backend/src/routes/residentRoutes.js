const express = require("express");
const router = express.Router();
const residentController = require("../controllers/residentController");
const { verifyToken } = require("../middlewares/authMiddleware");

// REGISTER RESIDENT (no auth required)
router.post("/register", residentController.registerResident);

// BOOK HOUSE (auth required)
router.post("/book", verifyToken, residentController.bookHouse);

// GET BOOKINGS (auth required)
router.get("/bookings", verifyToken, residentController.getBookings);

// DASHBOARD STATS (auth required)
router.get("/stats", verifyToken, residentController.getResidentStats);

module.exports = router;