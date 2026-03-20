const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const purchaseRequestController = require("../controllers/purchaseRequestController");

const router = express.Router();

router.get("/", auth, purchaseRequestController.listPurchaseRequests);
router.get("/:id", auth, purchaseRequestController.getPurchaseRequest);
router.get("/:id/pdf", auth, purchaseRequestController.getPurchaseRequestPdf);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseRequestController.createPurchaseRequest
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseRequestController.updatePurchaseRequest
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseRequestController.deletePurchaseRequest
);
router.post(
  "/:id/submit",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseRequestController.submitPurchaseRequest
);
router.post(
  "/:id/approve",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseRequestController.approvePurchaseRequest
);
router.post(
  "/:id/reject",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseRequestController.rejectPurchaseRequest
);

module.exports = router;
