const express = require("express");
const auth = require("../middlewares/auth");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/", auth, orderController.listOrders);
router.get("/:id", auth, orderController.getOrder);

module.exports = router;
