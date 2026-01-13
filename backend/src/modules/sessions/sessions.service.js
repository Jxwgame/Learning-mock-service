const AppError = require("../../core/errors/AppError");
const SessionsRepo = require("./sessions.repo");
const {
  logSessionCreate,
  logSessionRevoke,
} = require("../../core/logging/composite/auth.logger");

async function createSession({
  actor_user_id,
  user_id,
  device_id,
  session_token_hash,
  expired_at,
  request_id,
}) {
  const session = await SessionsRepo.create({
    user_id,
    device_id,
    session_token_hash,
    expired_at,
  });

  await logSessionCreate({
    actor_user_id: actor_user_id || user_id,
    user_id,
    session_id: session.session_id,
    device_id,
    request_id,
  });

  return session;
}

async function revokeSession({
  actor_user_id,
  session_id,
  reason = "manual",
  request_id,
}) {
  const session = await SessionsRepo.findValidBySessionId(session_id);
  if (!session) {
    throw new AppError("SESSION_NOT_FOUND", {
      status: 404,
      code: "SESSION_NOT_FOUND",
    });
  }

  await SessionsRepo.revoke(session_id);

  await logSessionRevoke({
    actor_user_id,
    user_id: session.user_id,
    session_id,
    reason,
    request_id,
  });

  return { revoked: true };
}

async function revokeAllSessionsOfUser({
  actor_user_id,
  user_id,
  reason = "revoke_all",
  request_id,
}) {
  const sessions = await SessionsRepo.findAllValidByUserId(user_id);

  for (const s of sessions) {
    await SessionsRepo.revoke(s.session_id);

    await logSessionRevoke({
      actor_user_id,
      user_id,
      session_id: s.session_id,
      reason,
      request_id,
    });
  }

  return { revoked_count: sessions.length };
}

async function touchSession(session_id) {
  await SessionsRepo.touch(session_id);
}

async function getValidByTokenHash(session_token_hash) {
  return SessionsRepo.findValidByTokenHash(session_token_hash);
}

module.exports = {
  createSession,
  revokeSession,
  revokeAllSessionsOfUser,
  touchSession,
  getValidByTokenHash,
};
