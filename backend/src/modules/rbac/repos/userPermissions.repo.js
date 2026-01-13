const db = require("../../../database/models");
const UserPermission = db.user_permissions;

// Get direct permission grants for a user (is_revoked = false)
async function getDirectGrantedPermissionIds(user_id) {
    const rows = await UserPermission.findAll({
        where: { user_id, is_revoked: false },
        attributes: ["permission_id"],
        raw: true,
    });
    return rows.map((r) => r.permission_id);
}

// Get direct permission revokes for a user (is_revoked = true)

async function getRevokedPermissionIds(user_id) {
    const rows = await UserPermission.findAll({
        where: { user_id, is_revoked: true },
        attributes: ["permission_id"],
        raw: true,
    });
    return rows.map((r) => r.permission_id);
}

// Grant a permission directly to a user

async function grantPermission(user_id, permission_id, assigned_by) {
    const [record, created] = await UserPermission.upsert({
        user_id,
        permission_id,
        is_revoked: false,
        assigned_by,
        assigned_at: new Date(),
    });
    return { record, created };
}

// Revoke a permission from a user (explicit deny)
async function revokePermission(user_id, permission_id, assigned_by) {
    const [record, created] = await UserPermission.upsert({
        user_id,
        permission_id,
        is_revoked: true,
        assigned_by,
        assigned_at: new Date(),
    });
    return { record, created };
}

// Remove direct permission entry (revert to role-based)
async function removeDirectPermission(user_id, permission_id) {
    const deleted = await UserPermission.destroy({
        where: { user_id, permission_id },
    });
    return deleted > 0;
}

module.exports = {
    getDirectGrantedPermissionIds,
    getRevokedPermissionIds,
    grantPermission,
    revokePermission,
    removeDirectPermission,
};
