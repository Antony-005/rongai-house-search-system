const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/landlord", verifyToken, agentController.addLandlord);
router.post("/house", verifyToken, agentController.addHouse);

module.exports = router;