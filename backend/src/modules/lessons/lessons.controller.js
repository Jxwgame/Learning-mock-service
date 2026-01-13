const service = require("./lessons.service");

function toInt(x) {
  const n = Number(x);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function listLessons(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    const version_id = toInt(req.params.versionId);
    if (!course_id || !version_id) return res.status(400).json({ ok: false, error: "INVALID_ID" });

    const data = await service.listLessons({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      version_id,
      req,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function createLesson(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    const version_id = toInt(req.params.versionId);
    if (!course_id || !version_id) return res.status(400).json({ ok: false, error: "INVALID_ID" });

    const data = await service.createLesson({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      version_id,
      payload: req.body || {},
      request_id: req.requestId,
    });

    return res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function updateLesson(req, res, next) {
  try {
    const lesson_id = toInt(req.params.lessonId);
    if (!lesson_id) return res.status(400).json({ ok: false, error: "INVALID_LESSON_ID" });

    const data = await service.updateLesson({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      lesson_id,
      payload: req.body || {},
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function deleteLesson(req, res, next) {
  try {
    const lesson_id = toInt(req.params.lessonId);
    if (!lesson_id) return res.status(400).json({ ok: false, error: "INVALID_LESSON_ID" });

    const data = await service.deleteLesson({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      lesson_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function listLessonContents(req, res, next) {
  try {
    const lesson_id = toInt(req.params.lessonId);
    if (!lesson_id) return res.status(400).json({ ok: false, error: "INVALID_LESSON_ID" });

    const data = await service.listLessonContents({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      lesson_id,
      req,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function addLessonContent(req, res, next) {
  try {
    const lesson_id = toInt(req.params.lessonId);
    if (!lesson_id) return res.status(400).json({ ok: false, error: "INVALID_LESSON_ID" });

    const data = await service.addLessonContent({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      lesson_id,
      payload: req.body || {},
      request_id: req.requestId,
    });

    return res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function updateLessonContent(req, res, next) {
  try {
    const content_id = toInt(req.params.contentId);
    if (!content_id) return res.status(400).json({ ok: false, error: "INVALID_CONTENT_ID" });

    const data = await service.updateLessonContent({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      content_id,
      payload: req.body || {},
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function deleteLessonContent(req, res, next) {
  try {
    const content_id = toInt(req.params.contentId);
    if (!content_id) return res.status(400).json({ ok: false, error: "INVALID_CONTENT_ID" });

    const data = await service.deleteLessonContent({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      content_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function listPublishedLessons(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    if (!course_id) return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });

    const data = await service.listPublishedLessons({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      req,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function listPublishedLessonContents(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    const lesson_id = toInt(req.params.lessonId);
    if (!course_id || !lesson_id) return res.status(400).json({ ok: false, error: "INVALID_ID" });

    const data = await service.listPublishedLessonContents({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      lesson_id,
      req,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  listLessonContents,
  addLessonContent,
  updateLessonContent,
  deleteLessonContent,
  listPublishedLessons,
  listPublishedLessonContents,
};
