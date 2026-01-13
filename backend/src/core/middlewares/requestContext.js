const crypto = require("crypto");

module.exports = function requestContext(req, res, next) {
  const requestId =
    typeof req.headers["x-request-id"] === "string" &&
      req.headers["x-request-id"].length > 0
      ? req.headers["x-request-id"]
      : crypto.randomUUID();

  const device_id =
    typeof req.headers["x-device-id"] === "string" &&
      req.headers["x-device-id"].length > 0
      ? req.headers["x-device-id"]
      : "unknown";
  req.ctx = {
    request_id: requestId,
    device_id,
    user_id: null,
    startedAt: Date.now(),
  };
  req.requestId = requestId;

  res.setHeader("X-Request-Id", requestId);

  next();
};
