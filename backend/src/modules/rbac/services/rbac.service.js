const userRolesRepo = require("../repos/userRoles.repo");
const rolePermRepo = require("../repos/rolePermissions.repo");
const { logAudit } = require("../../../core/logging/audit.logger");

async function assignRoleToUser({ actor_user_id, target_user_id, role_id, request_id, transaction }) {
  await userRolesRepo.assignRoleToUser(target_user_id, role_id, { transaction });

  await logAudit({
    actor_user_id,
    event_code: "rbac.role.assign",
    target_type: "user",
    target_id: target_user_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function revokeRoleFromUser({ actor_user_id, target_user_id, role_id, request_id, transaction }) {
  await userRolesRepo.revokeRoleFromUser(target_user_id, role_id, { transaction });

  await logAudit({
    actor_user_id,
    event_code: "rbac.role.revoke",
    target_type: "user",
    target_id: target_user_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function setRolePermissions({ actor_user_id, role_id, permission_ids, request_id, transaction }) {
  await rolePermRepo.setRolePermissions(role_id, permission_ids, { transaction });

  await logAudit({
    actor_user_id,
    event_code: "rbac.role.permission.set",
    target_type: "role",
    target_id: role_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = {
  assignRoleToUser,
  revokeRoleFromUser,
  setRolePermissions,
};
