const AppError = require("../../core/errors/AppError");

const UsersService = require("../users/users.service");
const SessionsService = require("../sessions/sessions.service");
const RefreshService = require("../refreshTokens/refreshTokens.service");
const MfaTrustService = require("../mfaTrust/mfaTrust.service");

const { signAccessToken } = require("../../core/auth/jwt");
const { sha256, randomToken } = require("../../core/auth/tokenHash");
const { verifyGoogleIdToken } = require("../../config/google");

const { logAudit } = require("../../core/logging/audit.logger");
const { sendOtpEmail } = require("../../config/mailer");

const MfaRedis = require("../../core/auth/mfa.redis");
const { createTransaction, verifyOtp } = require("../../core/auth/mfa.identity");
const MfaIdentityService = require("../../core/auth/mfa.identity");

async function googleExchange({
  id_token,
  device_id,
  mfa_trust_cookie,
  request_id,
}) {
  if (!id_token || !device_id) {
    throw new AppError("Missing required parameters.", 400);
  }

  try {
    const profile = await verifyGoogleIdToken(id_token);
    if (!profile) {
      throw new AppError("Invalid ID Token.", 400);
    }

    const user = await UsersService.upsertUserByGoogle({
      google_id: profile.sub,
      email: profile.email,
      first_name: profile.given_name,
      last_name: profile.family_name,
    });

    if (!user.is_active) {
      throw new AppError("USER_DISABLED", 403);
    }

    // Check MFA trust
    let trusted = false;
    if (mfa_trust_cookie) {
      trusted = await MfaTrustService.isTrustedDevice({
        user_id: user.user_id,
        device_id,
        cookie_token_hash: sha256(mfa_trust_cookie),
      });
    }

    if (!trusted) {
      const { mfa_tx } = await createTransaction(user.user_id);
      return {
        mfa_required: true,
        mfa_tx,
      };
    }

    // Create session and tokens
    const sessionToken = randomToken();
    const session = await SessionsService.createSession({
      actor_user_id: user.user_id,
      user_id: user.user_id,
      device_id,
      session_token_hash: sha256(sessionToken),
      expired_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
      request_id,
    });

    const refreshToken = randomToken();
    const refreshTtlMs = Number(process.env.REFRESH_TOKEN_TTL_MS);
    await RefreshService.issueRefreshToken({
      actor_user_id: user.user_id,
      user_id: user.user_id,
      session_id: session.session_id,
      device_id,
      token_hash: sha256(refreshToken),
      expires_at: new Date(Date.now() + refreshTtlMs),
      request_id,
    });

    const accessToken = signAccessToken({
      user_id: user.user_id,
      session_id: session.session_id,
      roles: user.roles || [],
    });

    return {
      user,
      tokens: {
        access_token: accessToken,
        session_token: sessionToken,
        refresh_token: refreshToken,
      },
    };
  } catch (error) {
    console.error("❌ Error in googleExchange:", error);
    throw new AppError(error.message || "Internal server error", 500);
  }
}

async function mfaChallenge({ mfa_tx, channel, request_id }) {
  const { getRedis } = require("../../config/redis");
  const redis = getRedis();

  const user_id = await MfaRedis.getTx(mfa_tx);
  if (!user_id) {
    throw new AppError("MFA_TX_EXPIRED", { status: 410 });
  }

  // Rate limit check
  const key = `mfa:send:${mfa_tx}`;
  const sent = await redis.incr(key);
  if (sent === 1) {
    await redis.expire(key, 60);
  }
  if (sent > 3) {
    throw new AppError("MFA_SEND_RATE_LIMIT", { status: 429 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  const user = await UsersService.getById(user_id);

  if (channel === "email") {
    await sendOtpEmail({ to: user.email, otp });
  } else {
    throw new AppError("MFA_CHANNEL_NOT_SUPPORTED", { status: 400 });
  }

  await MfaIdentityService.storeOtp(mfa_tx, otp);
}

/**
 * MFA verify (step 2)
 */
async function mfaVerify({ mfa_tx, otp, device_id, trust_device, request_id }) {
  const { user_id } = await verifyOtp({ mfa_tx, otp });

  const user = await UsersService.getById(user_id);
  if (!user || !user.is_active) {
    throw new AppError("USER_DISABLED", 403);
  }

  const sessionToken = randomToken();
  const sessionTtlMs =
    Number(process.env.SESSION_TTL_MS);

  const session = await SessionsService.createSession({
    actor_user_id: user_id,
    user_id,
    device_id,
    session_token_hash: sha256(sessionToken),
    expired_at: new Date(Date.now() + sessionTtlMs),
    request_id,
  });

  const refreshToken = randomToken();
  const refreshTtlMs = Number(process.env.REFRESH_TOKEN_TTL_MS);
  await RefreshService.issueRefreshToken({
    actor_user_id: user_id,
    user_id,
    session_id: session.session_id,
    device_id,
    token_hash: sha256(refreshToken),
    expires_at: new Date(Date.now() + refreshTtlMs),
    request_id,
  });

  // Create MFA trust cookie if requested
  let mfa_trust_cookie = null;
  if (trust_device) {
    const mfaTrustDays = Number(process.env.MFA_TRUST_DAYS);
    const cookieToken = randomToken(); // Generate raw token

    await MfaTrustService.createMfaTrust({
      actor_user_id: user_id,
      user_id,
      device_id,
      cookie_token_hash: sha256(cookieToken),
      expires_at: new Date(Date.now() + mfaTrustDays * 24 * 60 * 60 * 1000),
      request_id,
    });

    mfa_trust_cookie = cookieToken; // Return raw token to frontend
  }

  const accessToken = signAccessToken({
    user_id,
    session_id: session.session_id,
    roles: user.roles || [],
  });

  return {
    user,
    tokens: {
      access_token: accessToken,
      session_token: sessionToken,
      refresh_token: refreshToken,
    },
    mfa_trust_cookie,
  };
}

/**
 * Refresh access token
 */
async function refreshAccess({ refresh_token, request_id }) {
  const hashed = sha256(refresh_token);
  console.log("[DEBUG] Refreshing with hash:", hashed);

  const refresh = await RefreshService.findValidRefreshToken(hashed);
  console.log("[DEBUG] Found refresh token in DB:", refresh ? "YES" : "NO");

  if (!refresh) {
    console.error("[Auth] Refresh token not found/expired in DB for hash:", hashed);
    throw new AppError("REFRESH_TOKEN_INVALID", 401);
  }

  const newRefreshToken = randomToken();
  await RefreshService.rotateRefreshToken({
    actor_user_id: refresh.user_id,
    user_id: refresh.user_id,
    session_id: refresh.session_id,
    device_id: refresh.device_id,
    refresh_id: refresh.refresh_id,
    new_token_hash: sha256(newRefreshToken),
    request_id,
  });

  const user = await UsersService.getByIdWithRoles(refresh.user_id);

  const accessToken = signAccessToken({
    user_id: refresh.user_id,
    session_id: refresh.session_id,
    roles: user?.roles || [],
  });

  return {
    tokens: {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    },
  };
}

/**
 * Non-rotating session check for frontend initialization
 */
async function checkSession({ refresh_token }) {
  const hashed = sha256(refresh_token);
  const refresh = await RefreshService.findValidRefreshToken(hashed);

  if (!refresh) {
    throw new AppError("SESSION_EXPIRED", 401);
  }

  const user = await UsersService.getByIdWithRoles(refresh.user_id);

  const accessToken = signAccessToken({
    user_id: refresh.user_id,
    session_id: refresh.session_id,
    roles: user?.roles || [],
  });

  return {
    user,
    tokens: {
      access_token: accessToken,
    },
  };
}

module.exports = {
  googleExchange,
  mfaChallenge,
  mfaVerify,
  refreshAccess,
  checkSession,
};
