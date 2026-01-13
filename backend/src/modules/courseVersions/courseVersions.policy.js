const AppError = require("../../core/errors/AppError");
const CourseInstructorsRepo = require("../courseInstructors/courseInstructors.repo");
const CourseVersionsRepo = require("./courseVersions.repo");

function hasRole(roles, roleName) {
  if (!Array.isArray(roles)) return false;
  const normalizedRoles = roles.map(r => String(r).toLowerCase());
  const target = String(roleName).toLowerCase();

  if (target === "admin") {
    return normalizedRoles.includes("admin") || normalizedRoles.includes("super_admin");
  }
  return normalizedRoles.includes(target);
}

async function assertInstructorOfCourse({ actor_user_id, roles, course_id }) {
  if (hasRole(roles, "admin") || hasRole(roles, "super_admin")) return true;
  if (!hasRole(roles, "instructor")) {
    throw new AppError("FORBIDDEN", 403, "FORBIDDEN");
  }

  const ok = await CourseInstructorsRepo.hasActiveAssignment({
    course_id,
    instructor_id: actor_user_id,
  });
  if (!ok) throw new AppError("FORBIDDEN", 403, "FORBIDDEN");
  return true;
}

async function assertVersionBelongsToCourse({ course_id, version_id }) {
  const version = await CourseVersionsRepo.getById(version_id);
  if (!version || Number(version.course_id) !== Number(course_id)) {
    throw new AppError("VERSION_NOT_FOUND", 404, "VERSION_NOT_FOUND");
  }
  return version;
}

async function assertDraftEditable({ course_id, version_id }) {
  const version = await assertVersionBelongsToCourse({ course_id, version_id });
  if (String(version.status).toLowerCase() !== "draft") {
    throw new AppError("VERSION_NOT_EDITABLE", 409, "VERSION_NOT_EDITABLE");
  }
  return version;
}

async function assertPublished({ course_id, version_id }) {
  const version = await assertVersionBelongsToCourse({ course_id, version_id });
  if (String(version.status).toLowerCase() !== "published") {
    throw new AppError("VERSION_NOT_PUBLISHED", 409, "VERSION_NOT_PUBLISHED");
  }
  return version;
}

module.exports = {
  assertInstructorOfCourse,
  assertVersionBelongsToCourse,
  assertDraftEditable,
  assertPublished,
};
