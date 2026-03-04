const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.get("/houses", verifyToken, isAdmin, adminController.getAllHouses);
router.put("/houses/:id/verify", verifyToken, isAdmin, adminController.verifyHouse);
router.put("/houses/:id/deactivate", verifyToken, isAdmin, adminController.deactivateHouse);

module.exports = router;