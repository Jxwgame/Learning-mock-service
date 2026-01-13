const db = require("../../../database/models");
const RolePermission = db.role_permissions;

async function getRolePermissionIds(role_id) {
  const rows = await RolePermission.findAll({
    where: { role_id },
    attributes: ["permission_id"],
    raw: true,
  });
  return rows.map(r => r.permission_id);
}

async function setRolePermissions(role_id, permission_ids = [], options = {}) {
  await RolePermission.destroy({ where: { role_id }, ...options });

  if (!permission_ids.length) return true;

  const rows = permission_ids.map(permission_id => ({
    role_id,
    permission_id,
  }));
  await RolePermission.bulkCreate(rows, options);
  return true;
}

module.exports = { getRolePermissionIds, setRolePermissions };