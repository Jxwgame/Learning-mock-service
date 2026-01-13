const db = require("../../database/models");
const repo = require("./enrollments.repo");
const CourseVersionRepo = require("../courseVersions/courseVersions.repo");
const { logEnrollCourse } = require("../../core/logging/composite/enrollment.logger")

async function enrollCourse({
  actor_user_id,
  course_id,
  request_id,
}) {
  return db.sequelize.transaction(async (t) => {
    const result = await repo.enrollCourse({ actor_user_id, course_id }, { transaction: t });

    if (result.changed) {
      await logEnrollCourse({
        actor_user_id,
        course_id,
        enrollment_id: result.enrollment_id,
        old_status: result.old_status,
        new_status: result.new_status,
        request_id,
        transaction: t,
      });
    }

    return result;
  });
}

async function listMyCourses({ actor_user_id }) {
  return repo.listActiveByUser({
    user_id: actor_user_id,
  });
}

async function getCourseContent({ actor_user_id, course_id }) {
  // Enrollment is now checked by ensureEnrolled middleware
  const version_id = await CourseVersionRepo.getActivePublishedVersionId(course_id);
  if (!version_id) {
    const err = new Error("NO_PUBLISHED_VERSION");
    err.status = 404;
    throw err;
  }

  return { course_id, version_id };
}

async function unenrollCourse({
  actor_user_id,
  course_id,
  request_id,
}) {
  return db.sequelize.transaction(async (t) => {
    const result = await repo.unenrollCourse({ actor_user_id, course_id }, { transaction: t });

    // Log the unenrollment
    if (result.changed) {
      await logEnrollCourse({
        actor_user_id,
        course_id,
        enrollment_id: result.enrollment_id,
        old_status: result.old_status,
        new_status: result.new_status,
        request_id,
        transaction: t,
      });
    }

    return result;
  });
}

module.exports = {
  enrollCourse,
  listMyCourses,
  getCourseContent,
  unenrollCourse,
};
