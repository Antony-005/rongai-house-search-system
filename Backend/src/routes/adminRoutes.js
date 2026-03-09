const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Middleware: ensure admin
router.use(verifyToken, isAdmin);

// View all houses
router.get("/houses", adminController.getAllHouses);

// Verify a house
router.post("/verify-house/:houseId", adminController.verifyHouse);

// View all users
router.get("/users", adminController.getAllUsers);

module.exports = router;