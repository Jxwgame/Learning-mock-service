const AppError = require("../../core/errors/AppError");
const UsersRepo = require("./users.repo");

async function upsertUserByGoogle({
  google_id,
  email,
  first_name,
  last_name,
}) {
  const user = await UsersRepo.upsertByGoogle({
    google_id,
    email,
    first_name,
    last_name,
  });

  return user;
}

async function getById(user_id) {
  const user = await UsersRepo.getByIdWithRoles(user_id);
  if (!user) {
    throw new AppError("USER_NOT_FOUND", { status: 404 });
  }
  return user;
}

async function getByIdWithRoles(user_id) {
  const user = await UsersRepo.getByIdWithRoles(user_id);
  if (!user) {
    throw new AppError("USER_NOT_FOUND", { status: 404 });
  }
  return user;
}

module.exports = {
  upsertUserByGoogle,
  getById,
  getByIdWithRoles,
};
