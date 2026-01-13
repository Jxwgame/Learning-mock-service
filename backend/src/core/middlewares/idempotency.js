const { getRedis } = require("../../config/redis");

function idempotency({ ttlSec = 60 * 10 } = {}) {
  return async (req, res, next) => {
    const key = req.headers["x-idempotency-key"];
    if (!key) return next();

    const scope = req.user?.user_id;
    const redisKey = `idem:${scope}:${key}`;

    try {
      const redis = getRedis();

      const existing = await redis.get(redisKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        return res.status(parsed.status || 200).json(parsed.body);
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        const payload = JSON.stringify({
          status: res.statusCode,
          body,
        });

        // fire-and-forget
        redis
          .set(redisKey, payload, { EX: ttlSec })
          .catch(() => { });

        return originalJson(body);
      };

      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { idempotency };