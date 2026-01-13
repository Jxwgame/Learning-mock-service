const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

async function logEnrollCourse({
  actor_user_id,
  course_id,
  enrollment_id,
  old_status,
  new_status,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "enrollment",
    entity_id: enrollment_id,
    change_type: old_status ? "UPDATE" : "CREATE",
    old_values: old_status ? { status: old_status } : null,
    new_values: { status: new_status },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.enrollment.activate",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = { logEnrollCourse };