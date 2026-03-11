const express = require("express");
const router = express.Router();
const residentController = require("../controllers/residentController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Public
router.post("/register", residentController.registerResident);

// Protected — resident only
router.use(verifyToken);
router.use(requireRole("resident"));

router.post("/bookings", residentController.createBooking);
router.get("/bookings", residentController.getMyBookings);
router.get("/stats", residentController.getResidentStats);

module.exports = router;