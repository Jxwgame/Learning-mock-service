const express = require("express");
const {
    getAllUsersController,
    getUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController,
    toggleUserStatusController,
    assignRoleController,
    revokeRoleController,
    getRolesController,
    createRoleController,
    updateRoleController,
    deleteRoleController,
    setRolePermissionsController,
    getPermissionsController,
    createPermissionController,
    updatePermissionController,
    deletePermissionController,
    getSessionsController,
    getUserSessionsController,
    revokeSessionController,
    revokeUserSessionsController,
} = require("./admin.controller");

const { authRequired } = require("../../core/middlewares/authRequired");
const { requirePermission } = require("../../core/middlewares/requirePermission");
const validate = require("../../core/middlewares/validate");
const {
    createUserSchema,
    updateUserSchema,
    assignRoleSchema,
    createPermissionSchema,
    updatePermissionSchema
} = require("./admin.validation");

const router = express.Router();

// All admin routes require authentication and admin permission
router.use(authRequired);
router.use(requirePermission("admin.access"));

// ===== USERS =====
router.get("/users", getAllUsersController);
router.get("/users/:userId", getUserByIdController);
router.post("/users", requirePermission("user.create"), validate(createUserSchema), createUserController);
router.patch("/users/:userId", requirePermission("user.update"), validate(updateUserSchema), updateUserController);
router.delete("/users/:userId", requirePermission("user.delete"), deleteUserController);
router.patch("/users/:userId/toggle-status", requirePermission("user.update"), toggleUserStatusController);

// ===== USER ROLES =====
router.post("/users/:userId/roles", requirePermission("role.assign"), validate(assignRoleSchema), assignRoleController);
router.delete("/users/:userId/roles/:roleId", requirePermission("role.revoke"), revokeRoleController);

// ===== USER SESSIONS =====
router.get("/users/:userId/sessions", getUserSessionsController);
router.delete("/users/:userId/sessions", revokeUserSessionsController);

// ===== ROLES =====
router.get("/roles", getRolesController);

// ===== PERMISSIONS =====
router.get("/permissions", getPermissionsController);
router.post("/permissions", validate(createPermissionSchema), createPermissionController);
router.patch("/permissions/:permissionId", validate(updatePermissionSchema), updatePermissionController);
router.delete("/permissions/:permissionId", deletePermissionController);

// ===== SESSIONS =====
router.get("/sessions", getSessionsController);
router.delete("/sessions/:sessionId", revokeSessionController);

module.exports = router;
