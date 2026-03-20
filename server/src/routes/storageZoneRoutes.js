const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const storageZoneController = require("../controllers/storageZoneController");

const router = express.Router();

router.get("/", auth, storageZoneController.listStorageZones);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  storageZoneController.createStorageZone
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  storageZoneController.updateStorageZone
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  storageZoneController.deleteStorageZone
);

module.exports = router;
