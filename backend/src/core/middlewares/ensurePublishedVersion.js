const db = require("../../database/models");

async function ensurePublishedVersion(req, res, next) {
  try {
    const courseIdParam = req.params.courseId;
    const course_id = Number(courseIdParam);
    if (!Number.isInteger(course_id) || course_id <= 0) {
      return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });
    }

    const version = await db.course_versions.findOne({
      where: { course_id, status: "Published" },
      order: [["version_number", "DESC"]],
      raw: true,
    });

    if (!version) {
      return res.status(404).json({ ok: false, error: "NO_PUBLISHED_VERSION" });
    }

    req.version = version;
    return next();
  } catch (e) {
    return next(e);
  }
};

module.exports = { ensurePublishedVersion }