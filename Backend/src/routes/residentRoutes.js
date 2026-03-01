const express = require("express");
const router = express.Router();
const residentController = require("../controllers/residentController");

router.post("/register", residentController.registerResident);

module.exports = router;