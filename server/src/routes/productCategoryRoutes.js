const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const controller = require("../controllers/productCategoryController");

const router = express.Router();

router.get("/", auth, controller.listCategories);
router.post("/", auth, requireRole("SUPERADMIN", "ADMIN"), controller.createCategory);
router.patch("/:id", auth, requireRole("SUPERADMIN", "ADMIN"), controller.updateCategory);
router.delete("/:id", auth, requireRole("SUPERADMIN", "ADMIN"), controller.deleteCategory);

module.exports = router;
