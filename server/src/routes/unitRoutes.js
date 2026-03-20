const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const unitController = require("../controllers/unitController");

const router = express.Router();

router.get("/", auth, unitController.listUnits);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  unitController.createUnit
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  unitController.updateUnit
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  unitController.deleteUnit
);

module.exports = router;
