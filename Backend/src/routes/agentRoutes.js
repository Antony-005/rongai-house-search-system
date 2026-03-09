const express = require("express");
const router = express.Router();

const agentController = require("../controllers/agentController");

const {
  verifyToken,
  isAdmin,
  isAgent
} = require("../middlewares/authMiddleware");


/* ===========================
   ADMIN REGISTER AGENT
=========================== */

router.post(
  "/register",
  verifyToken,
  isAdmin,
  agentController.registerAgent
);


/* ===========================
   AGENT ROUTES
=========================== */

router.get(
  "/houses",
  verifyToken,
  isAgent,
  agentController.getAgentHouses
);

router.get(
  "/bookings",
  verifyToken,
  isAgent,
  agentController.getAgentBookings
);


module.exports = router;