const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const stockEntryController = require("../controllers/stockEntryController");

const router = express.Router();

router.get("/", auth, stockEntryController.listStockEntries);
router.get("/:id", auth, stockEntryController.getStockEntry);
router.get("/:id/pdf", auth, stockEntryController.getStockEntryPdf);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  stockEntryController.createStockEntry
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  stockEntryController.updateStockEntry
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  stockEntryController.deleteStockEntry
);
router.post(
  "/:id/approve",
  auth,
  requireRole("SUPERADMIN"),
  stockEntryController.approveStockEntry
);
router.post(
  "/:id/post",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  stockEntryController.postStockEntry
);

module.exports = router;
