const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

async function logCreateLesson({
  actor_user_id,
  course_id,
  version_id,
  lesson_id,
  new_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "lesson",
    entity_id: lesson_id,
    change_type: "CREATE",
    old_values: null,
    new_values: { course_id, version_id, ...new_values },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "lesson.create",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logUpdateLesson({
  actor_user_id,
  course_id,
  version_id,
  lesson_id,
  old_values,
  new_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "lesson",
    entity_id: lesson_id,
    change_type: "UPDATE",
    old_values,
    new_values,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "lesson.update",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logDeleteLesson({
  actor_user_id,
  course_id,
  version_id,
  lesson_id,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "lesson",
    entity_id: lesson_id,
    change_type: "DELETE",
    old_values: { course_id, version_id },
    new_values: null,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "lesson.delete",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = {
  logCreateLesson,
  logUpdateLesson,
  logDeleteLesson,
};
