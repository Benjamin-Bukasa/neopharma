const express = require("express");
const auth = require("../middlewares/auth");
const inventoryMovementController = require("../controllers/inventoryMovementController");

const router = express.Router();

router.get("/", auth, inventoryMovementController.listInventoryMovements);

module.exports = router;
