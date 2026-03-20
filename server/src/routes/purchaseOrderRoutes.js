const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const purchaseOrderController = require("../controllers/purchaseOrderController");

const router = express.Router();

router.get("/", auth, purchaseOrderController.listPurchaseOrders);
router.get("/:id", auth, purchaseOrderController.getPurchaseOrder);
router.get("/:id/pdf", auth, purchaseOrderController.getPurchaseOrderPdf);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseOrderController.createPurchaseOrder
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseOrderController.updatePurchaseOrder
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseOrderController.deletePurchaseOrder
);
router.post(
  "/:id/send",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  purchaseOrderController.sendPurchaseOrder
);

module.exports = router;
