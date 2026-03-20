const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const transferController = require("../controllers/transferController");

const router = express.Router();

router.get("/", auth, transferController.listTransfers);
router.get("/:id", auth, transferController.getTransfer);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  transferController.updateTransfer
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  transferController.deleteTransfer
);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  transferController.createTransfer
);
router.post(
  "/:id/complete",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  transferController.completeTransfer
);

module.exports = router;
