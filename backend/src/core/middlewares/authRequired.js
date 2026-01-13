const jwt = require("jsonwebtoken");
const SessionsRepo = require("../../modules/sessions/sessions.repo");

function parsePositiveInt(x) {
  const n = Number(x);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization;
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    // DEBUG AUTH
    if (!token) {
      console.warn("[Auth] No access token provided by client", { path: req.path });
      return res.status(401).json({ ok: false, error: "NO_ACCESS_TOKEN" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
    } catch (err) {
      console.warn("[Auth] Token verification failed:", err.message);
      return res.status(401).json({ ok: false, error: "ACCESS_TOKEN_INVALID" });
    }

    const user_id = parsePositiveInt(decoded?.sub);
    const session_id = parsePositiveInt(decoded?.sid);
    if (!user_id || !session_id) {
      return res.status(401).json({ ok: false, error: "INVALID_TOKEN_CLAIMS" });
    }

    const device_id = req.headers["x-device-id"] || req.ctx?.device_id || null;
    if (!device_id) return res.status(400).json({ ok: false, error: "MISSING_DEVICE_ID" });

    const session = await SessionsRepo.findValidBySessionId(session_id);
    if (!session) {
      console.warn("[Auth] Session invalid or not found:", { session_id });
      return res.status(401).json({ ok: false, error: "SESSION_INVALID" });
    }

    if (Number(session.user_id) !== user_id) {
      // console.warn("[Auth] Session user mismatch:", { sessionUserId: session.user_id, tokenUserId: user_id });
      return res.status(401).json({ ok: false, error: "SESSION_USER_MISMATCH" });
    }
    if (String(session.device_id) !== String(device_id)) {
      // console.warn("[Auth] Device mismatch:", { sessionDevice: session.device_id, reqDevice: device_id });
      return res.status(401).json({ ok: false, error: "DEVICE_MISMATCH" });
    }

    const roles = Array.isArray(decoded.roles)
      ? decoded.roles.filter((r) => typeof r === "string" && r.length <= 50)
      : [];

    req.user = { user_id, session_id, roles };
    if (req.ctx) req.ctx.user_id = user_id;

    return next();
  } catch (e) {
    console.error("[Auth] Unexpected auth error:", e);
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }
}

module.exports = { authRequired };
