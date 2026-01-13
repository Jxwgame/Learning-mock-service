const service = require("./assignments.service");

function toInt(x) {
  const n = Number(x);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function listPublishedAssignments(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    if (!course_id) return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });

    const data = await service.listPublishedAssignments({
      req,
      course_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function createAssignment(req, res, next) {
  try {
    const lesson_id = toInt(req.params.lessonId);
    if (!lesson_id) return res.status(400).json({ ok: false, error: "INVALID_LESSON_ID" });

    const data = await service.createAssignment({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      lesson_id,
      payload: req.body || {},
      request_id: req.ctx?.request_id,
    });

    return res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function updateAssignment(req, res, next) {
  try {
    const assignment_id = toInt(req.params.assignmentId);
    if (!assignment_id) return res.status(400).json({ ok: false, error: "INVALID_ASSIGNMENT_ID" });

    const data = await service.updateAssignment({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      assignment_id,
      payload: req.body || {},
      request_id: req.ctx?.request_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function deleteAssignment(req, res, next) {
  try {
    const assignment_id = toInt(req.params.assignmentId);
    if (!assignment_id) return res.status(400).json({ ok: false, error: "INVALID_ASSIGNMENT_ID" });

    const data = await service.deleteAssignment({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      assignment_id,
      request_id: req.ctx?.request_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function createSubmission(req, res, next) {
  try {
    const assignment_id = toInt(req.params.assignmentId);
    if (!assignment_id) return res.status(400).json({ ok: false, error: "INVALID_ASSIGNMENT_ID" });

    const data = await service.createSubmission({
      req,
      assignment_id,
      learner_user_id: req.user.user_id,
      payload: req.body || {},
      request_id: req.ctx?.request_id,
    });

    return res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function listMySubmissions(req, res, next) {
  try {
    const assignment_id = toInt(req.params.assignmentId);
    if (!assignment_id) return res.status(400).json({ ok: false, error: "INVALID_ASSIGNMENT_ID" });

    const data = await service.listMySubmissions({
      req,
      assignment_id,
      learner_user_id: req.user.user_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function listSubmissionsForAssignment(req, res, next) {
  try {
    const assignment_id = toInt(req.params.assignmentId);
    if (!assignment_id) return res.status(400).json({ ok: false, error: "INVALID_ASSIGNMENT_ID" });

    const data = await service.listSubmissionsForAssignment({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      assignment_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function gradeSubmission(req, res, next) {
  try {
    const submission_id = toInt(req.params.submissionId);
    if (!submission_id) return res.status(400).json({ ok: false, error: "INVALID_SUBMISSION_ID" });

    const data = await service.gradeSubmission({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      submission_id,
      payload: req.body || {},
      request_id: req.ctx?.request_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
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
};

async function getAssignment(req, res, next) {
  try {
    const assignment_id = toInt(req.params.assignmentId);
    if (!assignment_id) return res.status(400).json({ ok: false, error: "INVALID_ASSIGNMENT_ID" });

    const data = await service.getAssignment({
      req,
      assignment_id,
      actor_user_id: req.user.user_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}
module.exports.getAssignment = getAssignment;
