const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const controller = require("../controllers/productFamilyController");

const router = express.Router();

router.get("/", auth, controller.listFamilies);
router.post("/", auth, requireRole("SUPERADMIN", "ADMIN"), controller.createFamily);
router.patch("/:id", auth, requireRole("SUPERADMIN", "ADMIN"), controller.updateFamily);
router.delete("/:id", auth, requireRole("SUPERADMIN", "ADMIN"), controller.deleteFamily);

module.exports = router;
