
// User Permissions Controller
// Admin endpoints for managing direct user permissions


const service = require("../services/userPermissions.service");


// GET /admin/users/:userId/permissions || List all direct permissions for a user

async function listUserPermissions(req, res, next) {
    try {
        const user_id = Number(req.params.userId);
        const permissions = await service.listUserPermissions({ user_id });
        return res.json({ ok: true, data: permissions });
    } catch (e) {
        next(e);
    }
}

// POST /admin/users/:userId/permissions Grant a permission to a user

async function grantPermission(req, res, next) {
    try {
        const user_id = Number(req.params.userId);
        const { permission_name } = req.body;

        if (!permission_name) {
            return res.status(400).json({ ok: false, error: "PERMISSION_NAME_REQUIRED" });
        }

        const result = await service.grantPermission({
            user_id,
            permission_name,
            assigned_by: req.user.user_id,
        });

        return res.status(201).json({ ok: true, data: result });
    } catch (e) {
        next(e);
    }
}

// POST /admin/users/:userId/permissions/revoke || Revoke a permission from a user (explicit deny)
async function revokePermission(req, res, next) {
    try {
        const user_id = Number(req.params.userId);
        const { permission_name } = req.body;

        if (!permission_name) {
            return res.status(400).json({ ok: false, error: "PERMISSION_NAME_REQUIRED" });
        }

        const result = await service.revokePermission({
            user_id,
            permission_name,
            assigned_by: req.user.user_id,
        });

        return res.json({ ok: true, data: result });
    } catch (e) {
        next(e);
    }
}

// DELETE /admin/users/:userId/permissions/:permissionName || Remove direct permission entry (revert to role-based)
async function removeDirectPermission(req, res, next) {
    try {
        const user_id = Number(req.params.userId);
        const permission_name = req.params.permissionName;

        const result = await service.removeDirectPermission({
            user_id,
            permission_name,
        });

        return res.json({ ok: true, data: result });
    } catch (e) {
        next(e);
    }
}

// GET /admin/permissions || List all available permissions in the system
async function listAllPermissions(req, res, next) {
    try {
        const permissions = await service.listAllPermissions();
        return res.json({ ok: true, data: permissions });
    } catch (e) {
        next(e);
    }
}

module.exports = {
    listUserPermissions,
    grantPermission,
    revokePermission,
    removeDirectPermission,
    listAllPermissions,
};
