const AppError = require("../../core/errors/AppError");
const CourseInstructorsRepo = require("../courseInstructors/courseInstructors.repo");
const EnrollmentsRepo = require("../enrollments/enrollments.repo");

function hasRole(req, roleName) {
  if (!Array.isArray(req.user?.roles)) return false;
  const userRoles = req.user.roles.map(r => String(r).toLowerCase());
  return userRoles.includes(String(roleName).toLowerCase());
}

async function assertCanAccessCourse({ req, course_id }) {
  const user_id = req.user?.user_id;
  if (!user_id) throw new AppError("UNAUTHORIZED", 401, "UNAUTHORIZED");

  if (hasRole(req, "admin") || hasRole(req, "super_admin")) return true;

  if (hasRole(req, "instructor")) {
    const ok = await CourseInstructorsRepo.hasActiveAssignment({
      course_id,
      instructor_id: user_id,
    });
    if (ok) return true;
  }

  // Learner
  const enrolled = await EnrollmentsRepo.getByUserAndCourse({ course_id, user_id });
  if (enrolled && enrolled.status === 'active') return true;

  throw new AppError("FORBIDDEN", 403, "FORBIDDEN");
}

module.exports = {
  assertCanAccessCourse,
};