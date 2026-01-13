const AppError = require("../../core/errors/AppError");

async function assertAdminOfCourse({ actor_user_id, course_id }) {
  const roles = await getUserRoles(actor_user_id);
  const course = await getCourseById(course_id);

  if (!roles.some(r => String(r).toLowerCase() === "admin")) {
    throw new AppError("USER_NOT_ADMIN", { status: 403 });
  }
}

module.exports = { assertAdminOfCourse };