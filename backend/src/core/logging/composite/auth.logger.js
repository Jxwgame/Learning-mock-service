const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

// session
async function logSessionCreate({ actor_user_id, user_id, session_id, client_ip, device_id, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "session",
    entity_id: session_id,
    change_type: "CREATE",
    old_values: null,
    new_values: { user_id, device_id, client_ip },
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "session.create",
    target_type: "user",
    target_id: user_id,
    result: "SUCCESS",
    request_id,
  });
}

async function logSessionRevoke({ actor_user_id, user_id, session_id, reason, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "session",
    entity_id: session_id,
    change_type: "UPDATE",
    old_values: { status: "active" },
    new_values: { status: "revoked", reason },
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "session.revoke",
    target_type: "user",
    target_id: user_id,
    result: "SUCCESS",
    request_id,
  });
}

// refresh token
async function logRefreshIssue({ actor_user_id, user_id, refresh_id, session_id, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "refresh_token",
    entity_id: refresh_id,
    change_type: "CREATE",
    old_values: null,
    new_values: { user_id, session_id },
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "refresh.issue",
    target_type: "session",
    target_id: session_id,
    result: "SUCCESS",
    request_id,
  });
}

async function logRefreshRevoke({ actor_user_id, user_id, refresh_id, reason, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "refresh_token",
    entity_id: refresh_id,
    change_type: "UPDATE",
    old_values: { status: "active" },
    new_values: { status: "revoked", reason },
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "refresh.revoke",
    target_type: "user",
    target_id: user_id,
    result: "SUCCESS",
    request_id,
  });
}

// mfa trust
async function logCreateMfaTrust({ actor_user_id, user_id, trust_id, device_id, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "mfa_trust",
    entity_id: trust_id,
    change_type: "CREATE",
    old_values: null,
    new_values: { user_id, device_id },
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "mfa.trust.create",
    target_type: "user",
    target_id: user_id,
    result: "SUCCESS",
    request_id,
  });
}

async function logRevokeMfaTrust({ actor_user_id, user_id, trust_id, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "mfa_trust",
    entity_id: trust_id,
    change_type: "DELETE",
    old_values: { trust_id },
    new_values: null,
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "mfa.trust.revoke",
    target_type: "user",
    target_id: user_id,
    result: "SUCCESS",
    request_id,
  });
}

// users
async function logUserCreate({ actor_user_id, user_id, new_values, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "user",
    entity_id: user_id,
    change_type: "CREATE",
    old_values: null,
    new_values,
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "user.create",
    target_type: "user",
    target_id: user_id,
    result: "SUCCESS",
    request_id,
  });
}

async function logUserUpdate({ actor_user_id, user_id, old_values, new_values, request_id }) {
  await logEntityChange({
    actor_user_id,
    entity_type: "user",
    entity_id: user_id,
    change_type: "UPDATE",
    old_values,
    new_values,
    request_id,
  });
  await logAudit({
    actor_user_id,
    event_code: "user.update",
    target_type: "user",
    target_id: user_id,
    result: "SUCCESS",
    request_id,
  });
}

module.exports = {
  logSessionCreate,
  logSessionRevoke,
  logRefreshIssue,
  logRefreshRevoke,
  logCreateMfaTrust,
  logRevokeMfaTrust,
  logUserCreate,
  logUserUpdate,
};