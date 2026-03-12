const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// All agent routes require authentication + agent role
router.use(verifyToken);
router.use(requireRole("agent"));

// Landlord management
router.post("/landlords", agentController.addLandlord);
router.get("/landlords", agentController.getMyLandlords);

// House management
router.post("/houses", agentController.addHouse);
router.get("/houses", agentController.getMyHouses);
router.put("/houses/:id", agentController.updateHouse);
router.patch("/houses/:id/deactivate", agentController.deactivateHouse);

// Payment management
// NOTE: /payments/summary must be defined BEFORE /payments
// to prevent Express matching "summary" as a param
router.get("/payments/summary", agentController.getPaymentSummary);
router.post("/payments", agentController.addPayment);
router.get("/payments", agentController.getMyPayments);

module.exports = router;