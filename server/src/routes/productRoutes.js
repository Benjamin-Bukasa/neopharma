const express = require("express");
const multer = require("multer");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const productController = require("../controllers/productController");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/", auth, productController.listProducts);
router.get("/:id", auth, productController.getProduct);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.createProduct
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.updateProduct
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.deleteProduct
);

router.post(
  "/import",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  upload.single("file"),
  productController.importProducts
);

router.post(
  "/:id/components",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.addProductComponents
);
router.get("/:id/components", auth, productController.listProductComponents);
router.patch(
  "/:id/components/:componentId",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.updateProductComponent
);
router.delete(
  "/:id/components/:componentId",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.deleteProductComponent
);

router.post(
  "/:id/conversions",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.addProductConversions
);
router.get("/:id/conversions", auth, productController.listProductConversions);
router.patch(
  "/:id/conversions/:conversionId",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.updateProductConversion
);
router.delete(
  "/:id/conversions/:conversionId",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  productController.deleteProductConversion
);

module.exports = router;
