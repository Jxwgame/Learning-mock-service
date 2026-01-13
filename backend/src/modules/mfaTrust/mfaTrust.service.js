const AppError = require("../../core/errors/AppError");
const MfaTrustRepo = require("./mfaTrust.repo");
const {
  logCreateMfaTrust,
  logRevokeMfaTrust,
} = require("../../core/logging/composite/auth.logger");

async function createMfaTrust({
  actor_user_id,
  user_id,
  device_id,
  cookie_token_hash,
  expires_at,
  request_id,
}) {
  const row = await MfaTrustRepo.createTrust({
    user_id,
    device_id,
    cookie_token_hash,
    expires_at,
  });

  await logCreateMfaTrust({
    actor_user_id: actor_user_id || user_id,
    user_id,
    trust_id: row.trust_id,
    device_id,
    request_id,
  });

  return row;
}

async function isTrustedDevice({ user_id, device_id, cookie_token_hash }) {
  return MfaTrustRepo.isTrusted({
    user_id,
    device_id,
    cookie_token_hash,
  });
}

async function revokeMfaTrust({
  actor_user_id,
  trust_id,
  request_id,
}) {
  const ok = await MfaTrustRepo.revokeTrust({ trust_id });
  if (!ok) {
    throw new AppError("MFA_TRUST_NOT_FOUND", {
      status: 404,
      code: "MFA_TRUST_NOT_FOUND",
    });
  }

  await logRevokeMfaTrust({
    actor_user_id,
    user_id: actor_user_id,
    trust_id,
    request_id,
  });

  return { revoked: true };
}

module.exports = {
  createMfaTrust,
  isTrustedDevice,
  revokeMfaTrust,
};
