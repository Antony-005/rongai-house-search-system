const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// All admin routes require authentication + admin role
router.use(verifyToken);
router.use(requireRole("admin"));

// ── House management ──────────────────────────────────────────────────────────
// NOTE: Specific static paths must come before parameterised :id paths
router.get("/houses/pending", adminController.getPendingVerifications);
router.get("/houses", adminController.getAllHousesAdmin);
router.patch("/houses/:id/verify", adminController.verifyHouse);
router.patch("/houses/:id/reject", adminController.rejectHouse);

// ── Agent management ──────────────────────────────────────────────────────────
router.get("/agents", adminController.getAllAgents);

// ── Booking management ────────────────────────────────────────────────────────
router.get("/bookings", adminController.getAllBookings);
router.patch("/bookings/:id/status", adminController.updateBookingStatus);

// ── Payment management ────────────────────────────────────────────────────────
// NOTE: /payments/summary before /payments to avoid param collision
router.get("/payments/summary", adminController.getPaymentsSummaryByAgent);
router.get("/payments", adminController.getAllPayments);

// ── Reports ───────────────────────────────────────────────────────────────────
// NOTE: All /reports/* must be defined before any /:id style routes
router.get("/reports/overview",  adminController.getReportOverview);
router.get("/reports/houses",    adminController.getHousesReport);
router.get("/reports/bookings",  adminController.getBookingsReport);
router.get("/reports/agents",    adminController.getAgentsReport);

module.exports = router;