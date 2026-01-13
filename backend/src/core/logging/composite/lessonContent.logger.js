const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

async function logCreateLessonContent({
  actor_user_id,
  course_id,
  version_id,
  lesson_id,
  content_id,
  new_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "lesson_content",
    entity_id: content_id,
    change_type: "CREATE",
    old_values: null,
    new_values: {
      lesson_id,
      course_id,
      version_id,
      ...new_values,
    },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "lesson.content.create",
    target_type: "lesson",
    target_id: lesson_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logUpdateLessonContent({
  actor_user_id,
  course_id,
  version_id,
  lesson_id,
  content_id,
  old_values,
  new_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "lesson_content",
    entity_id: content_id,
    change_type: "UPDATE",
    old_values,
    new_values,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "lesson.content.update",
    target_type: "lesson",
    target_id: lesson_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logDeleteLessonContent({
  actor_user_id,
  course_id,
  version_id,
  lesson_id,
  content_id,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "lesson_content",
    entity_id: content_id,
    change_type: "DELETE",
    old_values: { lesson_id, course_id, version_id },
    new_values: null,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "lesson.content.delete",
    target_type: "lesson",
    target_id: lesson_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = {
  logCreateLessonContent,
  logUpdateLessonContent,
  logDeleteLessonContent,
};
