const UserRoleRepo = require("./userRoles.repo");
const RolePermRepo = require("./rolePermissions.repo");
const PermRepo = require("./permissions.repo");
const UserPermRepo = require("./userPermissions.repo");


async function getUserPermissions(user_id) {
  // Get role-based permission IDs
  const roleIds = await UserRoleRepo.getUserRoleIds(user_id);
  const rolePermIdSet = new Set();

  for (const role_id of roleIds) {
    const permIds = await RolePermRepo.getRolePermissionIds(role_id);
    permIds.forEach((id) => rolePermIdSet.add(id));
  }

  // Add direct grants
  const directGrants = await UserPermRepo.getDirectGrantedPermissionIds(user_id);
  directGrants.forEach((id) => rolePermIdSet.add(id));

  // Remove direct revokes
  const directRevokes = await UserPermRepo.getRevokedPermissionIds(user_id);
  directRevokes.forEach((id) => rolePermIdSet.delete(id));

  // Fetch permission names
  if (rolePermIdSet.size === 0) return [];
  return await PermRepo.getPermissionsByIds([...rolePermIdSet]);
}

module.exports = {
  getUserPermissions,
};
