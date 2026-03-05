const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");
const { verifyToken } = require("../middlewares/authMiddleware");

// ADD LANDLORD (auth required)
router.post("/landlords", verifyToken, agentController.addLandlord);

// ADD HOUSE (auth required)
router.post("/houses", verifyToken, agentController.addHouse);

module.exports = router;