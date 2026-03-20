const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const storeController = require("../controllers/storeController");

const router = express.Router();

router.get("/", auth, storeController.listStores);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  storeController.createStore
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  storeController.updateStore
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  storeController.deleteStore
);

module.exports = router;
