const db = require("../../database/models");
const AppError = require("../../core/errors/AppError");
const UsersRepo = require("../users/users.repo");
const { logAudit } = require("../../core/logging/audit.logger");

const User = db.users;
const Role = db.roles;
const Permission = db.permissions;

/**
 * USER MANAGEMENT
 */

async function createUser({ actor_user_id, email, first_name, last_name, role_ids, request_id }) {
    return db.sequelize.transaction(async (t) => {
        // 1. Check if email exists
        const existing = await User.findOne({ where: { email }, transaction: t });
        if (existing) {
            throw new AppError("EMAIL_ALREADY_EXISTS", 400);
        }

        // 2. Create User
        const newUser = await User.create({
            email,
            first_name,
            last_name,
            is_active: true,
        }, { transaction: t });

        // 3. Assign Roles
        if (role_ids && role_ids.length > 0) {
            for (const roleId of role_ids) {
                await db.user_roles.create({
                    user_id: newUser.user_id,
                    role_id: roleId,
                }, { transaction: t });
            }
        }

        // 4. Log Audit
        await logAudit({
            actor_user_id,
            event_code: "admin.user.create",
            target_type: "user",
            target_id: newUser.user_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return UsersRepo.getByIdWithRoles(newUser.user_id, { transaction: t });
    });
}

async function updateUser({ actor_user_id, user_id, payload, request_id }) {
    const { first_name, last_name, is_active } = payload;

    return db.sequelize.transaction(async (t) => {
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) throw new AppError("USER_NOT_FOUND", 404);

        await user.update({ first_name, last_name, is_active }, { transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "admin.user.update",
            target_type: "user",
            target_id: user_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return UsersRepo.getByIdWithRoles(user_id, { transaction: t });
    });
}

async function deleteUser({ actor_user_id, user_id, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) throw new AppError("USER_NOT_FOUND", 404);

        await user.destroy({ transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "admin.user.delete",
            target_type: "user",
            target_id: user_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return { deleted: true };
    });
}

async function toggleUserStatus({ actor_user_id, user_id, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) throw new AppError("USER_NOT_FOUND", 404);

        const newStatus = !user.is_active;
        await user.update({ is_active: newStatus }, { transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "admin.user.toggle_status",
            target_type: "user",
            target_id: user_id,
            result: "SUCCESS",
            payload: { is_active: newStatus },
            request_id,
            transaction: t,
        });

        return UsersRepo.getByIdWithRoles(user_id, { transaction: t });
    });
}

/**
 * ROLE MANAGEMENT
 */

async function createRole({ actor_user_id, role_name, description, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const role = await Role.create({ role_name, description }, { transaction: t });

        // 4. Log Audit
        await logAudit({
            actor_user_id,
            event_code: "rbac.role.create",
            target_type: "role",
            target_id: role.role_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return role;
    });
}

async function updateRole({ actor_user_id, role_id, role_name, description, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const role = await Role.findByPk(role_id, { transaction: t });
        if (!role) throw new AppError("ROLE_NOT_FOUND", 404);

        await role.update({ role_name, description }, { transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "rbac.role.update",
            target_type: "role",
            target_id: role_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return role;
    });
}

async function deleteRole({ actor_user_id, role_id, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const role = await Role.findByPk(role_id, { transaction: t });
        if (!role) throw new AppError("ROLE_NOT_FOUND", 404);

        await role.destroy({ transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "rbac.role.delete",
            target_type: "role",
            target_id: role_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return { deleted: true };
    });
}

/**
 * PERMISSION MANAGEMENT
 */

async function createPermission({ actor_user_id, permission_name, description, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const permission = await Permission.create({ permission_name, description }, { transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "rbac.permission.create",
            target_type: "permission",
            target_id: permission.permission_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return permission;
    });
}

async function updatePermission({ actor_user_id, permission_id, permission_name, description, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const permission = await Permission.findByPk(permission_id, { transaction: t });
        if (!permission) throw new AppError("PERMISSION_NOT_FOUND", 404);

        await permission.update({ permission_name, description }, { transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "rbac.permission.update",
            target_type: "permission",
            target_id: permission_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return permission;
    });
}

async function deletePermission({ actor_user_id, permission_id, request_id }) {
    return db.sequelize.transaction(async (t) => {
        const permission = await Permission.findByPk(permission_id, { transaction: t });
        if (!permission) throw new AppError("PERMISSION_NOT_FOUND", 404);

        await permission.destroy({ transaction: t });

        await logAudit({
            actor_user_id,
            event_code: "rbac.permission.delete",
            target_type: "permission",
            target_id: permission_id,
            result: "SUCCESS",
            request_id,
            transaction: t,
        });

        return { deleted: true };
    });
}

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    updatePermission,
    deletePermission,
};
