const { logAudit } = require("../audit.logger");
const { logEntityChange } = require("../entityChange.logger");

// Create Assignment
async function logCreateAssignment({
  actor_user_id,
  course_id,
  assignment_id,
  payload,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "assignment",
    entity_id: assignment_id,
    change_type: "CREATE",
    old_values: null,
    new_values: payload,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "assignment.create",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

// Update assignment

async function logUpdateAssignment({
  actor_user_id,
  course_id,
  assignment_id,
  old_values,
  new_values,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "assignment",
    entity_id: assignment_id,
    change_type: "UPDATE",
    old_values,
    new_values,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "assignment.update",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

// Delete assignment

async function logDeleteAssignment({
  actor_user_id,
  course_id,
  assignment_id,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "assignment",
    entity_id: assignment_id,
    change_type: "DELETE",
    old_values: { assignment_id },
    new_values: null,
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "assignment.delete",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

async function logCreateSubmission({
  actor_user_id,
  course_id,
  assignment_id,
  submission_id,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "submission",
    entity_id: submission_id,
    change_type: "CREATE",
    old_values: null,
    new_values: {
      assignment_id,
    },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "assignment.submission.create",
    target_type: "assignment",
    target_id: assignment_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

// Grade submission
async function logGradeSubmission({
  actor_user_id,
  course_id,
  submission_id,
  old_grade,
  new_grade,
  request_id,
  transaction,
}) {
  await logEntityChange({
    actor_user_id,
    entity_type: "submission",
    entity_id: submission_id,
    change_type: "UPDATE",
    old_values: { grade: old_grade },
    new_values: { grade: new_grade },
    request_id,
    transaction,
  });

  await logAudit({
    actor_user_id,
    event_code: "assignment.submission.grade",
    target_type: "course",
    target_id: course_id,
    result: "SUCCESS",
    request_id,
    transaction,
  });
}

module.exports = {
  logCreateAssignment,
  logUpdateAssignment,
  logDeleteAssignment,
  logCreateSubmission,
  logGradeSubmission,
};
