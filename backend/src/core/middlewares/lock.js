const { getRedis } = require("../../config/redis");
const crypto = require("crypto");

function lock({ keyFn, ttlSec = 10 } = {}) {
  return async (req, res, next) => {
    const key = keyFn ? keyFn(req) : null;
    if (!key) return next();

    const lockKey = `lock:${key}`;
    const token = crypto.randomUUID();

    try {
      const redis = getRedis();

      const ok = await redis.set(lockKey, token, {
        NX: true,
        EX: ttlSec,
      });

      if (!ok) {
        return res
          .status(409)
          .json({ ok: false, error: "RESOURCE_LOCKED" });
      }

      res.on("finish", async () => {
        try {
          const current = await redis.get(lockKey);
          if (current === token) {
            await redis.del(lockKey);
          }
        } catch {
        }
      });

      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { lock };