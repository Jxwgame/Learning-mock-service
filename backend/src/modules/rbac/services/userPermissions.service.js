// User Permissions Service Handles direct permission assignment/revocation for individual users


const UserPermRepo = require("../repos/userPermissions.repo");
const PermRepo = require("../repos/permissions.repo");
const { invalidatePermissionCache } = require("../../../core/middlewares/attachPermissions");
const db = require("../../../database/models");

async function listUserPermissions({ user_id }) {
    const directPerms = await db.user_permissions.findAll({
        where: { user_id },
        include: [
            {
                model: db.permissions,
                as: "permission",
                attributes: ["permission_id", "permission_name", "description"],
            },
            {
                model: db.users,
                as: "assigner",
                attributes: ["user_id", "email", "first_name", "last_name"],
            },
        ],
        order: [["assigned_at", "DESC"]],
    });

    return directPerms.map((p) => ({
        id: p.id,
        permission_id: p.permission_id,
        permission_name: p.permission?.permission_name,
        description: p.permission?.description,
        is_revoked: p.is_revoked,
        assigned_by: p.assigner ? {
            user_id: p.assigner.user_id,
            name: `${p.assigner.first_name || ''} ${p.assigner.last_name || ''}`.trim()
        } : null,
        assigned_at: p.assigned_at,
    }));
}

// Grant a permission directly to a user
async function grantPermission({ user_id, permission_name, assigned_by }) {
    const permission = await db.permissions.findOne({
        where: { permission_name },
    });

    if (!permission) {
        const err = new Error("PERMISSION_NOT_FOUND");
        err.status = 404;
        throw err;
    }

    await UserPermRepo.grantPermission(user_id, permission.permission_id, assigned_by);

    // Invalidate cache
    await invalidatePermissionCache(user_id);

    return { success: true, permission_name, is_revoked: false };
}

// Revoke a permission from a user (explicit deny)
async function revokePermission({ user_id, permission_name, assigned_by }) {
    const permission = await db.permissions.findOne({
        where: { permission_name },
    });

    if (!permission) {
        const err = new Error("PERMISSION_NOT_FOUND");
        err.status = 404;
        throw err;
    }

    await UserPermRepo.revokePermission(user_id, permission.permission_id, assigned_by);

    await invalidatePermissionCache(user_id);

    return { success: true, permission_name, is_revoked: true };
}


// Remove a direct permission entry (revert to role-based)
async function removeDirectPermission({ user_id, permission_name }) {
    const permission = await db.permissions.findOne({
        where: { permission_name },
    });

    if (!permission) {
        const err = new Error("PERMISSION_NOT_FOUND");
        err.status = 404;
        throw err;
    }

    const removed = await UserPermRepo.removeDirectPermission(user_id, permission.permission_id);

    await invalidatePermissionCache(user_id);

    return { success: removed, permission_name };
}

// List all available permissions in the system
async function listAllPermissions() {
    const permissions = await db.permissions.findAll({
        attributes: ["permission_id", "permission_name", "description"],
        order: [["permission_name", "ASC"]],
    });

    return permissions;
}

module.exports = {
    listUserPermissions,
    grantPermission,
    revokePermission,
    removeDirectPermission,
    listAllPermissions,
};
