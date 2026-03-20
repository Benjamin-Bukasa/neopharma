const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const approvalFlowController = require("../controllers/approvalFlowController");

const router = express.Router();

router.get("/", auth, approvalFlowController.listFlows);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  approvalFlowController.createFlow
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  approvalFlowController.updateFlow
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  approvalFlowController.deleteFlow
);

module.exports = router;
