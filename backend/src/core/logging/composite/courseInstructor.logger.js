const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

async function logAssignInstructorToCourse({
  actor_user_id,
  course_id,
  instructor_id,
  role,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "course_instructor",
    entity_id: instructor_id,
    change_type: "CREATE",
    old_values: null,
    new_values: {
      course_id,
      instructor_id,
      role,
    },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "course.instructor.assign",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logRevokeInstructorFromCourse({
  actor_user_id,
  course_id,
  instructor_id,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "course_instructor",
    entity_id: instructor_id,
    change_type: "DELETE",
    old_values: {
      course_id,
      instructor_id,
    },
    new_values: null,
    request_id,
    transaction,
  });


  await logAudit({
    actor_user_id,
    event_code: "course.instructor.revoke",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = {
  logAssignInstructorToCourse,
  logRevokeInstructorFromCourse,
};
