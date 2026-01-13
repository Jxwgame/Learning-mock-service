const db = require("../../../database/models");
const Permission = db.permissions;

async function getPermissionsByIds(permission_ids) {
  if (!permission_ids.length) return [];
  const perms = await Permission.findAll({
    where: { permission_id: permission_ids },
    attributes: ["permission_name"],
    raw: true,
  });
  return perms.map(p => p.permission_name);
}

module.exports = { getPermissionsByIds };
