const express = require("express");
const router = express.Router();
const houseController = require("../controllers/houseController");

router.get("/search", houseController.searchHouses);

module.exports = router;