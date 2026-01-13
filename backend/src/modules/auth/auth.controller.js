const { googleExchange, mfaChallenge, mfaVerify, refreshAccess, checkSession } = require("./auth.service");
const {
  revokeSession,
  revokeAllSessionsOfUser,
} = require("../sessions/sessions.service");
const { setAuthCookies, clearAuthCookies } = require("../../core/auth/cookies");

// POST /auth/login

async function googleExchangeController(req, res, next) {
  try {
    const { id_token, device_id } = req.body;

    if (!id_token || !device_id) {
      return res.status(400).json({ ok: false, error: "INVALID_INPUT" });
    }

    const mfa_trust_cookie = req.cookies?.mfa_trust_device || null;

    const result = await googleExchange({
      id_token,
      device_id,
      mfa_trust_cookie,
      request_id: req.ctx.request_id
    });
    // SetAuthCookie
    if (result.tokens) {
      setAuthCookies(res, {
        refreshToken: result.tokens.refresh_token,
        sessionToken: result.tokens.session_token
      });
      delete result.tokens.refresh_token;
      delete result.tokens.session_token;
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function mfaChallengeController(req, res, next) {
  try {
    const { mfa_tx, channel = "email" } = req.body;

    if (!mfa_tx) {
      return res.status(400).json({ ok: false, error: "INVALID_INPUT" });
    }

    await mfaChallenge({
      mfa_tx,
      channel,
      request_id: req.ctx.request_id
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function mfaVerifyController(req, res, next) {
  try {
    const { mfa_tx, otp, device_id, trust_device } = req.body;

    if (!mfa_tx || !otp || !device_id) {
      return res.status(400).json({ ok: false, error: "INVALID_INPUT" });
    }

    const result = await mfaVerify({
      mfa_tx,
      otp,
      device_id,
      trust_device: !!trust_device,
      request_id: req.ctx.request_id
    });

    // Set MFA trust cookie if generated
    if (result.mfa_trust_cookie) {
      const days = Number(process.env.MFA_TRUST_DAYS);
      res.cookie("mfa_trust_device", result.mfa_trust_cookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: days * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }
    if (result.tokens) {
      setAuthCookies(res, {
        refreshToken: result.tokens.refresh_token,
        sessionToken: result.tokens.session_token
      });
      delete result.tokens.refresh_token;
      delete result.tokens.session_token;
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /auth/session Non-rotating check for app init
async function checkSessionController(req, res, next) {
  try {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      return res.status(401).json({ ok: false, error: "SESSION_MISSING" });
    }

    const result = await checkSession({ refresh_token });

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /auth/refresh Rotating refresh
async function refreshAccessController(req, res, next) {
  try {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      return res.status(401).json({ ok: false, error: "REFRESH_TOKEN_MISSING" });
    }

    const result = await refreshAccess({
      refresh_token,
      request_id: req.ctx.request_id
    });

    // Set new refresh token cookie (Rotation)
    if (result.tokens && result.tokens.refresh_token) {
      setAuthCookies(res, { refreshToken: result.tokens.refresh_token });
      delete result.tokens.refresh_token;
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function logoutController(req, res, next) {
  try {
    const actor_user_id = req.user.user_id;
    const session_id = req.user.session_id;

    if (!session_id) {
      return res.status(400).json({ ok: false, error: "SESSION_NOT_FOUND" });
    }

    await revokeSession({
      actor_user_id,
      session_id,
      reason: "user_logout",
      request_id: req.ctx.request_id
    });

    clearAuthCookies(res);

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function logoutAllController(req, res, next) {
  try {
    const actor_user_id = req.user.user_id;

    await revokeAllSessionsOfUser({
      actor_user_id,
      user_id: actor_user_id,
      reason: "user_logout_all",
      request_id: req.ctx.request_id
    });

    clearAuthCookies(res);

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  googleExchangeController,
  mfaChallengeController,
  mfaVerifyController,
  refreshAccessController,
  checkSessionController,
  logoutController,
  logoutAllController,
};
