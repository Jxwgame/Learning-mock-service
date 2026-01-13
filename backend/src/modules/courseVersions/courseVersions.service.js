const db = require("../../database/models");
const AppError = require("../../core/errors/AppError");
const repo = require("./courseVersions.repo");
const {
  assertInstructorOfCourse,
  assertDraftEditable,
  assertPublished,
  assertVersionBelongsToCourse,
} = require("./courseVersions.policy");

const {
  logPublishCourseVersion,
  logRollbackCourseVersion,
  logArchiveCourseVersion,
} = require("../../core/logging/composite/courseVersion.logger");
const { logAudit } = require("../../core/logging/audit.logger");
const { logEntityChange } = require("../../core/logging/entityChange.logger");

async function listVersions({ actor_user_id, roles, course_id }) {
  await assertInstructorOfCourse({ actor_user_id, roles, course_id });
  return repo.listByCourse(course_id);
}

async function createDraftVersion({
  actor_user_id,
  roles,
  course_id,
  request_id,
}) {
  await assertInstructorOfCourse({ actor_user_id, roles, course_id });

  return db.sequelize.transaction(async (t) => {
    const nextVersionNumber = await repo.getNextVersionNumber(course_id, { transaction: t });

    const result = await repo.createDraft({
      course_id,
      version_number: nextVersionNumber,
      instructor_id: actor_user_id,
    }, { transaction: t });

    await logEntityChange({
      actor_user_id,
      entity_type: "course_version",
      entity_id: result.version_id,
      change_type: "CREATE",
      old_values: null,
      new_values: { status: result.new_status },
      request_id,
      transaction: t,
    });

    await logAudit({
      actor_user_id,
      event_code: "course.version.create.draft",
      target_type: "course_version",
      target_id: result.version_id,
      result: "SUCCESS",
      request_id,
      transaction: t,
    });

    return result;
  });
}

async function publishVersion({ actor_user_id, roles, course_id, version_id, request_id }) {
  await assertInstructorOfCourse({ actor_user_id, roles, course_id });
  await assertDraftEditable({ course_id, version_id });

  return db.sequelize.transaction(async (t) => {
    const result = await repo.publishAndSetActive({
      course_id,
      version_id,
    }, { transaction: t });

    await logPublishCourseVersion({
      actor_user_id,
      version_id,
      old_status: "Draft",
      new_status: "Published",
      request_id,
      transaction: t,
    });

    return result;
  });
}

async function rollbackToPublishedVersion({
  actor_user_id,
  roles,
  course_id,
  target_version_id,
  request_id,
}) {
  await assertInstructorOfCourse({ actor_user_id, roles, course_id });
  await assertPublished({ course_id, version_id: target_version_id });

  return db.sequelize.transaction(async (t) => {
    const result = await repo.setActivePublishedVersion({
      course_id,
      version_id: target_version_id,
    }, { transaction: t });

    await logRollbackCourseVersion({
      actor_user_id,
      from_version_id: result.from_version_id,
      to_version_id: result.to_version_id,
      request_id,
      transaction: t,
    });

    return result;
  });
}

async function archiveVersion({ actor_user_id, roles, course_id, version_id, request_id }) {
  await assertInstructorOfCourse({ actor_user_id, roles, course_id });
  await assertVersionBelongsToCourse({ course_id, version_id });

  const activeId = await repo.getActivePublishedVersionId(course_id);
  if (activeId && Number(activeId) === Number(version_id)) {
    throw new AppError("CANNOT_ARCHIVE_ACTIVE_VERSION", {
      status: 409,
      code: "CANNOT_ARCHIVE_ACTIVE_VERSION",
    });
  }

  return db.sequelize.transaction(async (t) => {
    const result = await repo.archiveVersion({ course_id, version_id }, { transaction: t });

    await logArchiveCourseVersion({
      actor_user_id,
      version_id: result.version_id,
      old_status: result.old_status,
      request_id,
      transaction: t,
    });

    return result;
  });
}

module.exports = {
  listVersions,
  createDraftVersion,
  publishVersion,
  rollbackToPublishedVersion,
  archiveVersion,
};
