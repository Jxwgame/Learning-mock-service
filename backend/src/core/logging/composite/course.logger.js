const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

async function logCreateCourse({
  actor_user_id,
  course_id,
  new_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "course",
    entity_id: course_id,
    change_type: "CREATE",
    old_values: null,
    new_values,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.create",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logUpdateCourse({
  actor_user_id,
  course_id,
  old_values,
  new_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "course",
    entity_id: course_id,
    change_type: "UPDATE",
    old_values,
    new_values,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.update",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logDeleteCourse({
  actor_user_id,
  course_id,
  old_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "course",
    entity_id: course_id,
    change_type: "DELETE",
    old_values,
    new_values: null,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.delete",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = {
  logCreateCourse,
  logUpdateCourse,
  logDeleteCourse,
};
