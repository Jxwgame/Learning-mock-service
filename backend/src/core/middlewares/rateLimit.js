const { getRedis } = require("../../config/redis");

function rateLimit({ windowSec = 60, max = 60, keyPrefix = "limit" } = {}) {
  return async (req, res, next) => {
    try {
      let client;
      try {
        client = getRedis();
      } catch (err) {
        // Redis not initialized yet or error
        return next();
      }

      if (!client || typeof client.incrBy !== "function") {
        return next();
      }

      const userId = req.user?.user_id ?? "guest";
      const routeKey = req.baseUrl + req.path;
      const key = `${keyPrefix}:${routeKey}:${userId}`;

      const count = await client.incrBy(key, 1);

      if (count === 1) {
        await client.expire(key, windowSec);
      }

      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - count)));

      if (count > max) {
        return res.status(429).json({ ok: false, error: "RATE_LIMITED" });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { rateLimit };