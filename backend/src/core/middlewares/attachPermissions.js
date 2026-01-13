// 
//  Middleware to attach user permissions to request object.
//  Uses Redis for caching to reduce database load.
//  Adds req.user.can(permission) helper function.
//  

const { getRedis } = require("../../config/redis");
const RbacRepo = require("../../modules/rbac/repos");

const CACHE_TTL_SECONDS = 300;
const CACHE_KEY_PREFIX = "perms:user:";


// Get cached permissions from Redis or fetch from database
async function getCachedPermissions(user_id) {
    try {
        const redis = getRedis();
        const cacheKey = `${CACHE_KEY_PREFIX}${user_id}`;

        // Try cache first
        const cached = await redis.get(cacheKey);
        if (cached) {
            return new Set(JSON.parse(cached));
        }

        // Cache miss - fetch from DB
        const perms = await RbacRepo.getUserPermissions(user_id);
        const permSet = new Set(perms);

        // Store in cache
        await redis.set(cacheKey, JSON.stringify([...permSet]), {
            EX: CACHE_TTL_SECONDS,
        });

        return permSet;
    } catch (err) {
        console.warn("Redis unavailable for permission cache, using DB:", err.message);
        const perms = await RbacRepo.getUserPermissions(user_id);
        return new Set(perms);
    }
}


// Invalidate permission cache for a user (call after granting/revoking permissions)

async function invalidatePermissionCache(user_id) {
    try {
        const redis = getRedis();
        const cacheKey = `${CACHE_KEY_PREFIX}${user_id}`;
        await redis.del(cacheKey);
    } catch (err) {
        console.warn("Failed to invalidate permission cache:", err.message);
    }
}


// Middleware to attach permissions and can() helper to req.user
function attachPermissions() {
    return async (req, res, next) => {
        try {
            const user_id = req.user?.user_id;
            if (!user_id) {
                return next();
            }

            const permSet = await getCachedPermissions(user_id);

            // Attach permissions array to user
            req.user.permissions = [...permSet];

            // Attach can() helper function
            req.user.can = (permission) => permSet.has(permission);

            // Attach hasAnyPermission helper
            req.user.hasAnyPermission = (...perms) => perms.some((p) => permSet.has(p));

            // Attach hasAllPermissions helper
            req.user.hasAllPermissions = (...perms) => perms.every((p) => permSet.has(p));

            next();
        } catch (err) {
            console.error("attachPermissions error:", err);
            next(err);
        }
    };
}

module.exports = {
    attachPermissions,
    invalidatePermissionCache,
    getCachedPermissions,
};
