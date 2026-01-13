const db = require("../../database/models");
const AppError = require("../../core/errors/AppError");
const repo = require("./courseInstructors.repo");
const {
  logAssignInstructorToCourse,
  logRevokeInstructorFromCourse,
} = require("../../core/logging/composite/courseInstructor.logger");

function toInt(x) {
  const n = Number(x);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function normalizeRole(x) {
  const r = String(x || "owner").toLowerCase();
  return ["owner", "assistant"].includes(r) ? r : "owner";
}

async function assignInstructor({
  actor_user_id,
  actor_is_admin,
  course_id,
  instructor_id,
  role,
  request_id,
}) {
  if (!actor_is_admin) {
    throw new AppError("FORBIDDEN_ADMIN_ONLY", 403, "FORBIDDEN");
  }
  course_id = toInt(course_id);
  instructor_id = toInt(instructor_id);
  if (!course_id || !instructor_id) {
    throw new AppError("INVALID_ID", 400, "INVALID_ID");
  }

  const normalizedRole = normalizeRole(role);

  return db.sequelize.transaction(async (t) => {
    const result = await repo.assignInstructorToCourse({
      course_id,
      instructor_id,
      role: normalizedRole,
      assigned_by: actor_user_id,
    }, { transaction: t });

    if (result.already_assigned) {
      throw new AppError("ALREADY_ASSIGNED", 409, "ALREADY_ASSIGNED");
    }

    await logAssignInstructorToCourse({
      actor_user_id,
      course_id,
      instructor_id,
      role: normalizedRole,
      request_id,
      transaction: t,
    });

    return result;
  });
}

async function revokeInstructor({
  actor_user_id,
  actor_is_admin,
  course_id,
  instructor_id,
  request_id,
}) {
  if (!actor_is_admin) {
    throw new AppError("FORBIDDEN_ADMIN_ONLY", 403, "FORBIDDEN");
  }
  course_id = toInt(course_id);
  instructor_id = toInt(instructor_id);
  if (!course_id || !instructor_id) {
    throw new AppError("INVALID_ID", 400, "INVALID_ID");
  }

  return db.sequelize.transaction(async (t) => {
    const ok = await repo.revokeInstructorFromCourse({ course_id, instructor_id }, { transaction: t });
    if (!ok) {
      throw new AppError("NOT_ASSIGNED", 404, "NOT_ASSIGNED");
    }

    await logRevokeInstructorFromCourse({
      actor_user_id,
      course_id,
      instructor_id,
      request_id,
      transaction: t,
    });

    return { revoked: true };
  });
}

async function listCourseInstructors({ actor_user_id, actor_is_admin, course_id }) {
  course_id = toInt(course_id);
  if (!course_id) {
    throw new AppError("INVALID_ID", 400, "INVALID_ID");
  }

  if (!actor_is_admin) {
    const allowed = await repo.hasActiveAssignment({
      course_id,
      instructor_id: actor_user_id,
    });
    if (!allowed) {
      throw new AppError("FORBIDDEN", 403, "FORBIDDEN");
    }
  }

  return repo.listActiveInstructorsByCourse(course_id);
}

async function myTeachingCourses({ instructor_id }) {
  instructor_id = toInt(instructor_id);
  if (!instructor_id) {
    throw new AppError("INVALID_ID", 400, "INVALID_ID");
  }

  return repo.listTeachingCoursesWithMetadata(instructor_id);
}

async function syncInstructors({ actor_user_id, actor_is_admin, course_id, instructors, request_id }) {
  if (!actor_is_admin) {
    throw new AppError("FORBIDDEN_ADMIN_ONLY", 403, "FORBIDDEN");
  }
  course_id = toInt(course_id);
  if (!course_id) {
    throw new AppError("INVALID_ID", 400, "INVALID_ID");
  }

  // Dedup inputs
  const uniqueInstructors = [];
  const seenIds = new Set();

  for (const i of instructors) {
    const iid = toInt(i.instructor_id);
    if (iid && !seenIds.has(iid)) {
      seenIds.add(iid);
      uniqueInstructors.push({
        instructor_id: iid,
        role: normalizeRole(i.role)
      });
    }
  }

  // Sync Repo
  return db.sequelize.transaction(async (t) => {
    const result = await repo.syncInstructorsInCourse({
      course_id,
      instructors: uniqueInstructors,
      assigned_by: actor_user_id
    }, { transaction: t });

    return result;
  });
}

module.exports = {
  assignInstructor,
  revokeInstructor,
  listCourseInstructors,
  myTeachingCourses,
  syncInstructors,
};
