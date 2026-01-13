const AppError = require("../../core/errors/AppError");
const RefreshRepo = require("./refreshTokens.repo");
const {
  logRefreshIssue,
  logRefreshRevoke,
} = require("../../core/logging/composite/auth.logger");

async function issueRefreshToken({
  actor_user_id,
  user_id,
  session_id,
  device_id,
  token_hash,
  expires_at,
  request_id,
}) {
  const row = await RefreshRepo.create({
    user_id,
    session_id,
    device_id,
    token_hash,
    expires_at,
  });

  await logRefreshIssue({
    actor_user_id,
    user_id,
    refresh_id: row.refresh_id,
    session_id,
    request_id,
  });

  return row;
}

async function revokeRefreshToken({
  actor_user_id,
  refresh_id,
  reason = "manual",
  request_id,
}) {
  const ok = await RefreshRepo.revoke(refresh_id, {});
  if (!ok) {
    throw new AppError("REFRESH_NOT_FOUND", {
      status: 404,
      code: "REFRESH_NOT_FOUND",
    });
  }

  await logRefreshRevoke({
    actor_user_id,
    user_id: actor_user_id,
    refresh_id,
    reason,
    request_id,
  });

  return { revoked: true };
}

// Rotate refresh token - revoke old and issue new
async function rotateRefreshToken({
  actor_user_id,
  user_id,
  session_id,
  device_id,
  refresh_id,
  new_token_hash,
  request_id,
}) {
  // Revoke the old token
  await RefreshRepo.revoke(refresh_id, {
    replaced_by_refresh_id: null,
  });

  // Issue new one
  const refreshTtlMs = Number(process.env.REFRESH_TOKEN_TTL_MS) || 1000 * 60 * 60 * 24 * 7;
  return issueRefreshToken({
    actor_user_id,
    user_id,
    session_id,
    device_id,
    token_hash: new_token_hash,
    expires_at: new Date(Date.now() + refreshTtlMs),
    request_id,
  });
}

async function findValidRefreshToken(token_hash) {
  return RefreshRepo.findValidByHash(token_hash);
}

module.exports = {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  findValidRefreshToken,
};
