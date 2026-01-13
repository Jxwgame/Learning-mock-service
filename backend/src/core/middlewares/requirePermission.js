const RbacRepo = require("../../modules/rbac/repos");

const permCache = new Map();
const CACHE_MS = 60 * 1000;

async function getUserPermSet(user_id) {
  const cached = permCache.get(user_id);
  if (cached && cached.exp > Date.now()) return cached.perms;

  const perms = await RbacRepo.getUserPermissions(user_id);
  const set = new Set(perms);

  permCache.set(user_id, { perms: set, exp: Date.now() + CACHE_MS });
  return set;
}

function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

      const perms = await getUserPermSet(user_id);
      if (!perms.has(permission)) {
        return res.status(403).json({ ok: false, error: "FORBIDDEN" });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { requirePermission };
