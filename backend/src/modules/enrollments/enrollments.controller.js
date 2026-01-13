const service = require("./enrollments.service");

function toInt(x) {
  const n = Number(x);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function enroll(req, res, next) {
  try {
    const course_id = toInt(req.params.id);
    if (!course_id)
      return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });

    const data = await service.enrollCourse({
      actor_user_id: req.user.user_id,
      course_id,
      request_id: req.requestId,
    });

    return res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function listMyCourses(req, res, next) {
  try {
    const data = await service.listMyCourses({
      actor_user_id: req.user.user_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function getCourseContent(req, res, next) {
  try {
    const course_id = toInt(req.params.id);
    if (!course_id)
      return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });

    const data = await service.getCourseContent({
      actor_user_id: req.user.user_id,
      course_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function unenroll(req, res, next) {
  try {
    const course_id = toInt(req.params.id);
    if (!course_id)
      return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });

    const data = await service.unenrollCourse({
      actor_user_id: req.user.user_id,
      course_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  enroll,
  listMyCourses,
  getCourseContent,
  unenroll,
};
