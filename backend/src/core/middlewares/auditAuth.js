const { logAudit } = require("../logging/audit.logger");


// Audit middleware for auth endpoints ใช้เฉพาะ /auth/login, /auth/refresh, /auth/logout

function auditAuth({ eventSuccess, eventFailed }) {
  return async (req, res, next) => {
    const request_id = req.request_id;

    // requestContext
    if (!request_id) {
      const err = new Error("REQUEST_ID_REQUIRED");
      err.status = 500;
      return next(err);
    }
    res.on("finish", async () => {
      try {
        const status = res.statusCode;

        const actor_user_id =
          req.user?.user_id ||
          res.locals?.auth_user_id ||
          null;

        if (status >= 200 && status < 300) {
          await logAudit({
            actor_user_id,
            event_code: eventSuccess,
            target_type: "user",
            target_id: actor_user_id || 0,
            result: "SUCCESS",
            request_id,
          });
          return;
        }

        if (status === 401 || status === 403) {
          await logAudit({
            actor_user_id,
            event_code: eventFailed,
            target_type: "user",
            target_id: actor_user_id || 0,
            result: "FAILED",
            request_id,
          });
        }
      } catch (e) {
        console.error("[AUDIT_AUTH_ERROR]", e.message);
      }
    });

    next();
  };
}

module.exports = auditAuth;