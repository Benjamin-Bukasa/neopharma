const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const inventoryController = require("../controllers/inventoryController");

const router = express.Router();

router.get("/", auth, inventoryController.listInventory);
router.post(
  "/adjust",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  inventoryController.adjustInventory
);
router.patch(
  "/:id/min-level",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  inventoryController.updateMinLevel
);

module.exports = router;
