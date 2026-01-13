const userRolesRepo = require("../repos/userRoles.repo");
const rolePermRepo = require("../repos/rolePermissions.repo");
const permRepo = require("../repos/permissions.repo");

async function getUserPermissions(user_id) {
  const roleIds = await userRolesRepo.getUserRoleIds(user_id);
  if (!roleIds.length) return [];

  const permIds = new Set();
  for (const role_id of roleIds) {
    const ids = await rolePermRepo.getRolePermissionIds(role_id);
    ids.forEach(id => permIds.add(id));
  }

  return permRepo.getPermissionsByIds([...permIds]);
}

module.exports = { getUserPermissions };
