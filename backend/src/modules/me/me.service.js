// src/modules/me/me.service.js
const UsersRepo = require("../users/users.repo");

async function getMe({ user_id, request_id }) {
  const user = await UsersRepo.getByIdWithRoles(user_id);
  if (!user) {
    const AppError = require("../../core/errors/AppError");
    throw new AppError("USER_NOT_FOUND", { status: 404 });
  }
  return {
    user_id: user.user_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    roles: user.roles || [],
    is_active: user.is_active,
  };
}

async function updateMe({ user_id, first_name, last_name, request_id }) {
  await UsersRepo.update(user_id, { first_name, last_name });

  const user = await UsersRepo.getByIdWithRoles(user_id);
  return {
    user_id: user.user_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    roles: user.roles || [],
    is_active: user.is_active,
  };
}

module.exports = { getMe, updateMe };
