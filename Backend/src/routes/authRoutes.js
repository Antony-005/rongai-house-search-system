const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// REGISTER USER
router.post("/register", authController.register);

// LOGIN USER
router.post("/login", authController.login);

module.exports = router;