const express = require("express");
const router = express.Router();

const controller = require("../controllers/userPermissions.controller");
const { authRequired } = require("../../../core/middlewares/authRequired");
const { requirePermission } = require("../../../core/middlewares/requirePermission");

// All routes require admin.access permission
const adminAccess = requirePermission("admin.access");


// List all available permissions in the system
router.get("/permissions", authRequired, adminAccess, controller.listAllPermissions);


// List all direct permissions for a specific user
router.get("/users/:userId/permissions", authRequired, adminAccess, controller.listUserPermissions);

// Grant a permission directly to a user
router.post("/users/:userId/permissions", authRequired, adminAccess, controller.grantPermission);


// Revoke a permission from a user (explicit deny even if role has it)
router.post("/users/:userId/permissions/revoke", authRequired, adminAccess, controller.revokePermission);


//Remove a direct permission entry (revert to role-based)
router.delete("/users/:userId/permissions/:permissionName", authRequired, adminAccess, controller.removeDirectPermission);

module.exports = router;
