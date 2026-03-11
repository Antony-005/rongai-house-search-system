const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// All admin routes require authentication + admin role
router.use(verifyToken);
router.use(requireRole("admin"));

// House management
// NOTE: /houses/pending must be defined BEFORE /houses/:id
// to prevent Express matching "pending" as an :id parameter
router.get("/houses/pending", adminController.getPendingVerifications);
router.get("/houses", adminController.getAllHousesAdmin);
router.patch("/houses/:id/verify", adminController.verifyHouse);
router.patch("/houses/:id/reject", adminController.rejectHouse);

// Agent management
router.get("/agents", adminController.getAllAgents);

// Booking management
router.get("/bookings", adminController.getAllBookings);
router.patch("/bookings/:id/status", adminController.updateBookingStatus);

module.exports = router;