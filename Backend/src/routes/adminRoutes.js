const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// GET ALL HOUSES (admin only)
router.get("/houses", verifyToken, isAdmin, adminController.getAllHouses);

// VERIFY HOUSE (admin only)
router.put("/houses/:id/verify", verifyToken, isAdmin, adminController.verifyHouse);

// DEACTIVATE HOUSE (admin only)
router.put("/houses/:id/deactivate", verifyToken, isAdmin, adminController.deactivateHouse);

module.exports = router;