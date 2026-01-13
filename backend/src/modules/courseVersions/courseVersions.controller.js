const service = require("./courseVersions.service");

function toInt(x) {
  const n = Number(x);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function listVersions(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    if (!course_id) return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });

    const data = await service.listVersions({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function createDraft(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    if (!course_id) return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });

    const data = await service.createDraftVersion({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      request_id: req.requestId,
    });

    return res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function publishVersion(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    const version_id = toInt(req.params.versionId);
    if (!course_id || !version_id) return res.status(400).json({ ok: false, error: "INVALID_ID" });

    const data = await service.publishVersion({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      version_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function rollbackToVersion(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    const version_id = toInt(req.params.versionId);
    if (!course_id || !version_id) return res.status(400).json({ ok: false, error: "INVALID_ID" });

    const data = await service.rollbackToPublishedVersion({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      target_version_id: version_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function archiveVersion(req, res, next) {
  try {
    const course_id = toInt(req.params.courseId);
    const version_id = toInt(req.params.versionId);
    if (!course_id || !version_id) return res.status(400).json({ ok: false, error: "INVALID_ID" });

    const data = await service.archiveVersion({
      actor_user_id: req.user.user_id,
      roles: req.user.roles || [],
      course_id,
      version_id,
      request_id: req.requestId,
    });

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listVersions,
  createDraft,
  publishVersion,
  rollbackToVersion,
  archiveVersion,
};
