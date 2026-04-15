const express = require("express");
const router = express.Router();
const houseController = require("../controllers/houseController");

// Public routes — no auth required
router.get("/public", houseController.getPublicHouses);
router.get("/",       houseController.getAllHouses);
router.get("/:id",    houseController.getHouseById);

module.exports = router;