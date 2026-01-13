const db = require("../../../database/models");
const UserRole = db.user_roles;

async function getUserRoleIds(user_id) {
  const rows = await UserRole.findAll({
    where: { user_id },
    attributes: ["role_id"],
    raw: true,
  });
  return rows.map(r => r.role_id);
}

async function assignRoleToUser(user_id, role_id, options = {}) {
  const existing = await UserRole.findOne({ where: { user_id, role_id }, ...options });
  if (existing) return true;
  await UserRole.create({ user_id, role_id }, options);
  return true;
}

async function revokeRoleFromUser(user_id, role_id, options = {}) {
  await UserRole.destroy({ where: { user_id, role_id }, ...options });
  return true;
}

module.exports = {
  getUserRoleIds,
  assignRoleToUser,
  revokeRoleFromUser,
};