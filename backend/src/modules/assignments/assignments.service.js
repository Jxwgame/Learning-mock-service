const db = require("../../database/models");
const AppError = require("../../core/errors/AppError");
const AssignmentsRepo = require("./assignments.repo");
const SubmissionsRepo = require("./submissions.repo");
const LessonsRepo = require("../lessons/lessons.repo");
const CoursesRepo = require("../course/course.repo");
const CourseVersionsRepo = require("../courseVersions/courseVersions.repo");
const { assertCanAccessCourse } = require("../course/course.policy");
const {
  assertInstructorOfCourse,
  assertDraftEditable,
} = require("../courseVersions/courseVersions.policy");
const {
  logCreateAssignment,
  logUpdateAssignment,
  logDeleteAssignment,
  logCreateSubmission,
  logGradeSubmission,
} = require("../../core/logging/composite/assignment.logger");

function normalizeAssignmentCreate(payload) {
  const title = String(payload.title || "").trim();
  if (!title)
    throw new AppError("TITLE_REQUIRED", 400, "TITLE_REQUIRED");

  return {
    title,
    description: payload.description ? String(payload.description) : "",
    due_date: payload.due_date ? new Date(payload.due_date) : null,
    max_score:
      payload.max_score !== undefined ? Number(payload.max_score) : null,
  };
}

function normalizeAssignmentUpdate(payload) {
  const patch = {};
  if (payload.title !== undefined) patch.title = String(payload.title).trim();
  if (payload.description !== undefined)
    patch.description = String(payload.description);
  if (payload.due_date !== undefined)
    patch.due_date = payload.due_date ? new Date(payload.due_date) : null;
  if (payload.max_score !== undefined)
    patch.max_score =
      payload.max_score === null ? null : Number(payload.max_score);

  if (patch.title !== undefined && !patch.title) {
    throw new AppError("TITLE_REQUIRED", 400, "TITLE_REQUIRED");
  }
  return patch;
}

function normalizeSubmission(payload) {
  // mock submit: เก็บเป็น file_url หรือ text ก็ได้
  const file_url = payload.file_url ? String(payload.file_url) : null;
  const comments = payload.comments ? String(payload.comments) : null;

  if (!file_url && !comments) {
    throw new AppError("SUBMISSION_EMPTY", 400, "SUBMISSION_EMPTY");
  }
  return { file_url, comments };
}

async function listPublishedAssignments({ req, course_id }) {
  // Permission-based check
  const isInstructorOrAdmin = typeof req.user?.can === 'function'
    ? req.user.can('assignment.manage') || req.user.can('admin.access')
    : ((req.user?.roles || []).map(r => String(r).toLowerCase()).some(r => ['instructor', 'admin', 'super_admin'].includes(r)));

  console.log("[DEBUG] listPublishedAssignments", {
    userId: req.user.user_id,
    courseId: course_id,
    isInstructorOrAdmin
  });

  // CASE 1: Specific Course Listing
  if (course_id) {
    await assertCanAccessCourse({ req, course_id });

    if (isInstructorOrAdmin) {
      const versions = await CourseVersionsRepo.listByCourse(course_id);
      const draft = versions.find((v) => v.status === "Draft");
      if (draft) {
        return AssignmentsRepo.listByCourseVersion({
          course_id,
          version_id: draft.version_id,
        });
      }
    }

    const activeVersionId = await CoursesRepo.getActivePublishedVersionId(course_id);
    if (!activeVersionId) {
      if (isInstructorOrAdmin) return [];
      throw new AppError("NO_PUBLISHED_VERSION", 404, "NO_PUBLISHED_VERSION");
    }

    return AssignmentsRepo.listByCourseVersion({
      course_id,
      version_id: activeVersionId,
    });
  }

  return [];
}

async function getAssignment({ req, assignment_id, actor_user_id }) {
  const assignment = await AssignmentsRepo.getById(assignment_id);
  if (!assignment)
    throw new AppError("ASSIGNMENT_NOT_FOUND", { status: 404 });

  const lesson = await LessonsRepo.getLessonById(assignment.lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  // Permission Check
  // - Instructor/Admin: Can read any if they own the course.
  // - Learner: Can read ONLY if it's the ACTIVE PUBLISHED version.

  // Let's use assertCanAccessCourse for general access (enrolled or public or instructor)
  await assertCanAccessCourse({ req, course_id: lesson.course_id });

  // Version Check for Learners
  const activeVersionId = await CoursesRepo.getActivePublishedVersionId(lesson.course_id);
  // If user is Instructor/Admin of this course, they can see ANY version (including draft).
  // If user is Learner, they can ONLY see active version items.

  const isInstructorOrAdmin = typeof req.user?.can === 'function'
    ? req.user.can('assignment.manage') || req.user.can('admin.access')
    : ((req.user?.roles || []).map(r => String(r).toLowerCase()).some(r => ['instructor', 'admin', 'super_admin'].includes(r)));

  if (!isInstructorOrAdmin) {
    // Must be active published version
    if (!activeVersionId || Number(lesson.version_id) !== Number(activeVersionId)) {
      throw new AppError("ASSIGNMENT_NOT_AVAILABLE", 404, "ASSIGNMENT_NOT_AVAILABLE");
    }
  }

  return assignment;
}


// Instructor create assignment under lesson (must be draft version)

async function createAssignment({ actor_user_id, roles, lesson_id, payload, request_id }) {
  const lesson = await LessonsRepo.getLessonById(lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  const data = normalizeAssignmentCreate(payload);

  return db.sequelize.transaction(async (t) => {
    const assignment = await AssignmentsRepo.createAssignment({
      lesson_id,
      ...data,
    }, { transaction: t });

    await logCreateAssignment({
      actor_user_id,
      course_id: lesson.course_id,
      assignment_id: assignment.assignment_id,
      payload: {
        lesson_id,
        title: assignment.title,
        due_date: assignment.due_date,
        max_score: assignment.max_score,
      },
      request_id,
      transaction: t,
    });

    return assignment;
  });
}

async function updateAssignment({
  actor_user_id,
  roles,
  assignment_id,
  payload,
  request_id,
}) {
  const assignment = await AssignmentsRepo.getById(assignment_id);
  if (!assignment)
    throw new AppError("ASSIGNMENT_NOT_FOUND", 404, "ASSIGNMENT_NOT_FOUND");

  const lesson = await LessonsRepo.getLessonById(assignment.lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  const patch = normalizeAssignmentUpdate(payload);

  return db.sequelize.transaction(async (t) => {
    const { old_values, updated_assignment } =
      await AssignmentsRepo.updateAssignment(assignment_id, patch, { transaction: t });

    await logUpdateAssignment({
      actor_user_id,
      course_id: lesson.course_id,
      assignment_id,
      old_values,
      new_values: {
        title: updated_assignment.title,
        due_date: updated_assignment.due_date,
        max_score: updated_assignment.max_score,
      },
      request_id,
      transaction: t,
    });
    return updated_assignment;
  });
}

async function deleteAssignment({ actor_user_id, roles, assignment_id, request_id }) {
  const assignment = await AssignmentsRepo.getById(assignment_id);
  if (!assignment)
    throw new AppError("ASSIGNMENT_NOT_FOUND", 404, "ASSIGNMENT_NOT_FOUND");

  const lesson = await LessonsRepo.getLessonById(assignment.lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  return db.sequelize.transaction(async (t) => {
    const deleted = await AssignmentsRepo.deleteAssignment(assignment_id, { transaction: t });

    await logDeleteAssignment({
      actor_user_id,
      course_id: lesson.course_id,
      assignment_id,
      request_id,
      transaction: t,
    });

    return { deleted: true };
  });
}

// Learner submit: ต้องเป็น assignment ของ active published version เท่านั้น

async function createSubmission({
  req,
  assignment_id,
  learner_user_id,
  payload,
  request_id,
}) {
  const assignment = await AssignmentsRepo.getById(assignment_id);
  if (!assignment)
    throw new AppError("ASSIGNMENT_NOT_FOUND", 404, "ASSIGNMENT_NOT_FOUND");

  const lesson = await LessonsRepo.getLessonById(assignment.lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  await assertCanAccessCourse({ req, course_id: lesson.course_id });

  const activeVersionId =
    await CoursesRepo.getActivePublishedVersionId(lesson.course_id);
  if (!activeVersionId)
    throw new AppError("NO_PUBLISHED_VERSION", 404, "NO_PUBLISHED_VERSION");

  if (Number(lesson.version_id) !== Number(activeVersionId)) {
    throw new AppError("ASSIGNMENT_NOT_AVAILABLE", 409, "ASSIGNMENT_NOT_AVAILABLE");
  }

  let isLate = false;
  if (assignment.due_date) {
    const due = new Date(assignment.due_date).getTime();
    if (Date.now() > due) {
      isLate = true;
    }
  }

  const data = normalizeSubmission(payload);

  return db.sequelize.transaction(async (t) => {
    const submission = await SubmissionsRepo.createSubmission({
      assignment_id,
      user_id: learner_user_id,
      submission_date: new Date(),
      file_url: data.file_url,
      comments: data.comments,
    }, { transaction: t });

    await logCreateSubmission({
      actor_user_id: learner_user_id,
      course_id: lesson.course_id,
      assignment_id,
      submission_id: submission.submission_id,
      request_id,
      transaction: t,
    });

    return submission;
  });
}

async function listMySubmissions({ req, assignment_id, learner_user_id }) {
  const assignment = await AssignmentsRepo.getById(assignment_id);
  if (!assignment)
    throw new AppError("ASSIGNMENT_NOT_FOUND", 404, "ASSIGNMENT_NOT_FOUND");

  const lesson = await LessonsRepo.getLessonById(assignment.lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  await assertCanAccessCourse({ req, course_id: lesson.course_id });

  return SubmissionsRepo.listByAssignmentAndUser({
    assignment_id,
    user_id: learner_user_id,
  });
}

async function listSubmissionsForAssignment({
  actor_user_id,
  roles,
  assignment_id,
  request_id,
}) {
  const assignment = await AssignmentsRepo.getById(assignment_id);
  if (!assignment)
    throw new AppError("ASSIGNMENT_NOT_FOUND", 404, "ASSIGNMENT_NOT_FOUND");

  const lesson = await LessonsRepo.getLessonById(assignment.lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });

  return SubmissionsRepo.listByAssignment({ assignment_id });
}

async function gradeSubmission({
  actor_user_id,
  roles,
  submission_id,
  payload,
  request_id,
}) {
  const grade = Number(payload.grade);
  if (!Number.isFinite(grade) || grade < 0) {
    throw new AppError("INVALID_GRADE", 400, "INVALID_GRADE");
  }

  const submission = await SubmissionsRepo.getById(submission_id);
  if (!submission)
    throw new AppError("SUBMISSION_NOT_FOUND", 404, "SUBMISSION_NOT_FOUND");

  const assignment = await AssignmentsRepo.getById(submission.assignment_id);
  if (!assignment)
    throw new AppError("ASSIGNMENT_NOT_FOUND", 404, "ASSIGNMENT_NOT_FOUND");

  const lesson = await LessonsRepo.getLessonById(assignment.lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", 404, "LESSON_NOT_FOUND");

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });

  const oldGrade = submission.grade;

  return db.sequelize.transaction(async (t) => {
    // === DB MUTATION ===
    const updated = await SubmissionsRepo.gradeSubmission(submission_id, {
      grade,
      feedback: payload.feedback || null,
      status: 'graded',
      graded_by: actor_user_id,
      graded_at: new Date(),
      updated_at: new Date(),
    }, { transaction: t });

    // === AUDIT (WITHIN TRANSACTION) ===
    await logGradeSubmission({
      actor_user_id,
      course_id: lesson.course_id,
      submission_id,
      old_grade: oldGrade,
      new_grade: grade,
      request_id,
      transaction: t,
    });

    return updated;
  });
}

module.exports = {
  listPublishedAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createSubmission,
  listMySubmissions,
  listSubmissionsForAssignment,
  gradeSubmission,
  getAssignment,
};
