const db = require("../../database/models");
const UsersRepo = require("../users/users.repo");
const SessionsService = require("../sessions/sessions.service");
const RbacService = require("../rbac/services/rbac.service");

const User = db.users;
const Role = db.roles;
const Permission = db.permissions;
const Session = db.sessions;

const AdminService = require("./admin.service");

// ===== USERS =====
async function getAllUsersController(req, res, next) {
    try {
        const users = await User.findAll({
            include: [{
                model: Role,
                as: "roles",
                attributes: ["role_id", "role_name"],
                through: { attributes: [] },
            }],
            order: [["created_at", "DESC"]],
        });

        const result = users.map(u => {
            const userData = u.toJSON();
            userData.roles = (userData.roles || []).map(r => r.role_name);
            return userData;
        });

        res.json({ users: result });
    } catch (error) {
        next(error);
    }
}

async function getUserByIdController(req, res, next) {
    try {
        const { userId } = req.params;
        const user = await UsersRepo.getByIdWithRoles(userId);

        if (!user) {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
}

async function createUserController(req, res, next) {
    try {
        const { email, first_name, last_name, role_ids } = req.body;
        const actor_user_id = req.user.user_id;

        const user = await AdminService.createUser({
            actor_user_id,
            email,
            first_name,
            last_name,
            role_ids,
            request_id: req.ctx?.request_id,
        });

        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
}

async function updateUserController(req, res, next) {
    try {
        const { userId } = req.params;
        const { first_name, last_name, is_active } = req.body;
        const actor_user_id = req.user.user_id;

        const user = await AdminService.updateUser({
            actor_user_id,
            user_id: userId,
            payload: { first_name, last_name, is_active },
            request_id: req.ctx?.request_id,
        });

        res.json({ user });
    } catch (error) {
        next(error);
    }
}

async function deleteUserController(req, res, next) {
    try {
        const { userId } = req.params;
        const actor_user_id = req.user.user_id;

        const result = await AdminService.deleteUser({
            actor_user_id,
            user_id: userId,
            request_id: req.ctx?.request_id,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
}

async function toggleUserStatusController(req, res, next) {
    try {
        const { userId } = req.params;
        const actor_user_id = req.user.user_id;

        const user = await AdminService.toggleUserStatus({
            actor_user_id,
            user_id: userId,
            request_id: req.ctx?.request_id,
        });

        res.json({ user });
    } catch (error) {
        next(error);
    }
}

// ===== ROLES =====

async function assignRoleController(req, res, next) {
    try {
        const { userId } = req.params;
        const { role_id } = req.body;
        const actorUserId = req.user.user_id;

        if (!role_id || isNaN(parseInt(role_id))) {
            return res.status(400).json({ error: "INVALID_ROLE_ID", message: "role_id is required and must be a valid integer" });
        }

        await db.sequelize.transaction(async (t) => {
            await RbacService.assignRoleToUser({
                actor_user_id: actorUserId,
                target_user_id: parseInt(userId),
                role_id: parseInt(role_id),
                request_id: req.ctx?.request_id,
                transaction: t,
            });
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
}

async function revokeRoleController(req, res, next) {
    try {
        const { userId, roleId } = req.params;
        const actorUserId = req.user.user_id;

        await db.sequelize.transaction(async (t) => {
            await RbacService.revokeRoleFromUser({
                actor_user_id: actorUserId,
                target_user_id: parseInt(userId),
                role_id: parseInt(roleId),
                request_id: req.ctx?.request_id,
                transaction: t,
            });
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
}

async function getRolesController(req, res, next) {
    try {
        const roles = await Role.findAll({
            attributes: ["role_id", "role_name", "description"],
            order: [["role_id", "ASC"]],
        });

        res.json({ roles: roles.map(r => r.toJSON()) });
    } catch (error) {
        next(error);
    }
}

// ===== PERMISSIONS =====

async function getPermissionsController(req, res, next) {
    try {
        const permissions = await Permission.findAll({
            attributes: ["permission_id", "permission_name", "description"],
            order: [["permission_id", "ASC"]],
        });

        res.json({ permissions: permissions.map(p => p.toJSON()) });
    } catch (error) {
        next(error);
    }
}

// ===== SESSIONS =====

async function getSessionsController(req, res, next) {
    try {
        // Get sessions for current user
        const userId = req.user.user_id;
        const sessions = await Session.findAll({
            where: { user_id: userId, revoked_at: null },
            order: [["created_at", "DESC"]],
        });

        res.json({ sessions: sessions.map(s => s.toJSON()) });
    } catch (error) {
        next(error);
    }
}

async function getUserSessionsController(req, res, next) {
    try {
        const { userId } = req.params;
        const sessions = await Session.findAll({
            where: { user_id: parseInt(userId), revoked_at: null },
            order: [["created_at", "DESC"]],
        });

        res.json({ sessions: sessions.map(s => s.toJSON()) });
    } catch (error) {
        next(error);
    }
}

async function revokeSessionController(req, res, next) {
    try {
        const { sessionId } = req.params;
        const actorUserId = req.user.user_id;

        await SessionsService.revokeSession({
            actor_user_id: actorUserId,
            session_id: sessionId,
            reason: "admin_revoke",
            request_id: req.id,
        });

        res.json({ revoked: true });
    } catch (error) {
        next(error);
    }
}

async function revokeUserSessionsController(req, res, next) {
    try {
        const { userId } = req.params;
        const actorUserId = req.user.user_id;

        const result = await SessionsService.revokeAllSessionsOfUser({
            actor_user_id: actorUserId,
            user_id: parseInt(userId),
            reason: "admin_revoke_all",
            request_id: req.id,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
}

// ===== ROLE CRUD =====

async function createRoleController(req, res, next) {
    try {
        const { role_name, description } = req.body;
        const actor_user_id = req.user.user_id;

        const role = await AdminService.createRole({
            actor_user_id,
            role_name,
            description,
            request_id: req.ctx?.request_id,
        });

        res.status(201).json({ role });
    } catch (error) {
        next(error);
    }
}

async function updateRoleController(req, res, next) {
    try {
        const { roleId } = req.params;
        const { role_name, description } = req.body;
        const actor_user_id = req.user.user_id;

        const role = await AdminService.updateRole({
            actor_user_id,
            role_id: roleId,
            role_name,
            description,
            request_id: req.ctx?.request_id,
        });

        res.json({ role });
    } catch (error) {
        next(error);
    }
}

async function deleteRoleController(req, res, next) {
    try {
        const { roleId } = req.params;
        const actor_user_id = req.user.user_id;

        const result = await AdminService.deleteRole({
            actor_user_id,
            role_id: roleId,
            request_id: req.ctx?.request_id,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
}

async function setRolePermissionsController(req, res, next) {
    try {
        const { roleId } = req.params;
        const { permission_ids } = req.body;
        const actor_user_id = req.user.user_id;

        await db.sequelize.transaction(async (t) => {
            await RbacService.setRolePermissions({
                actor_user_id,
                role_id: parseInt(roleId),
                permission_ids,
                request_id: req.ctx?.request_id,
                transaction: t,
            });
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
}

// ===== PERMISSION CRUD =====

async function createPermissionController(req, res, next) {
    try {
        const { permission_name, description } = req.body;
        const actor_user_id = req.user.user_id;

        const permission = await AdminService.createPermission({
            actor_user_id,
            permission_name,
            description,
            request_id: req.ctx?.request_id,
        });

        res.status(201).json({ permission });
    } catch (error) {
        next(error);
    }
}

async function updatePermissionController(req, res, next) {
    try {
        const { permissionId } = req.params;
        const { permission_name, description } = req.body;
        const actor_user_id = req.user.user_id;

        const permission = await AdminService.updatePermission({
            actor_user_id,
            permission_id: permissionId,
            permission_name,
            description,
            request_id: req.ctx?.request_id,
        });

        res.json({ permission });
    } catch (error) {
        next(error);
    }
}

async function deletePermissionController(req, res, next) {
    try {
        const { permissionId } = req.params;
        const actor_user_id = req.user.user_id;

        const result = await AdminService.deletePermission({
            actor_user_id,
            permission_id: permissionId,
            request_id: req.ctx?.request_id,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsersController,
    getUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController,
    toggleUserStatusController,
    assignRoleController,
    revokeRoleController,
    getRolesController,
    createRoleController,
    updateRoleController,
    deleteRoleController,
    setRolePermissionsController,
    getPermissionsController,
    createPermissionController,
    updatePermissionController,
    deletePermissionController,
    getSessionsController,
    getUserSessionsController,
    revokeSessionController,
    revokeUserSessionsController,
};

