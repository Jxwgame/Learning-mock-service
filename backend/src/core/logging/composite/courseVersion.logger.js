const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

async function logPublishCourseVersion({
  actor_user_id,
  version_id,
  old_status,
  new_status,
  request_id,
  transaction,
}) {
  if (old_status !== "Draft" || new_status !== "Published") {
    const err = new Error("INVALID_PUBLISH_STATUS_CHANGE");
    err.status = 500;
    throw err;
  }

  await logEntityChange({
    actor_user_id,
    entity_type: "course_version",
    entity_id: version_id,
    change_type: "STATUS_CHANGE",
    old_values: { status: old_status },
    new_values: { status: new_status },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.version.publish",
    target_type: "course_version",
    target_id: version_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logRollbackCourseVersion({
  actor_user_id,
  from_version_id,
  to_version_id,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "course",
    entity_id: from_version_id,
    change_type: "STATUS_CHANGE",
    old_values: { active_published_version_id: from_version_id },
    new_values: { active_published_version_id: to_version_id },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.version.rollback",
    target_type: "course_version",
    target_id: to_version_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logArchiveCourseVersion({
  actor_user_id,
  version_id,
  old_status,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "course_version",
    entity_id: version_id,
    change_type: "STATUS_CHANGE",
    old_values: { status: old_status },
    new_values: { status: "Archived" },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.version.archive",
    target_type: "course_version",
    target_id: version_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = {
  logPublishCourseVersion,
  logRollbackCourseVersion,
  logArchiveCourseVersion,
};