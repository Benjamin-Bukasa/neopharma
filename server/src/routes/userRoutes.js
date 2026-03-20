const express = require("express");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", auth, requireRole("SUPERADMIN", "ADMIN"), userController.listUsers);
router.get("/:id", auth, requireRole("SUPERADMIN", "ADMIN"), userController.getUser);
router.post(
  "/",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  userController.createUser
);
router.patch(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  userController.updateUser
);
router.patch(
  "/:id/permissions",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  userController.updateUserPermissions
);
router.delete(
  "/:id",
  auth,
  requireRole("SUPERADMIN", "ADMIN"),
  userController.deactivateUser
);

module.exports = router;
