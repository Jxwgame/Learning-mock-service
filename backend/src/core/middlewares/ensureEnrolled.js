const db = require("../../database/models");

async function ensureEnrolled(req, res, next) {
  try {
    const user_id = req.user?.user_id;
    if (!user_id)
      return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

    const courseIdParam = req.params.id;
    const course_id = Number(courseIdParam);
    if (!Number.isInteger(course_id) || course_id <= 0) {
      return res.status(400).json({ ok: false, error: "INVALID_COURSE_ID" });
    }

    const row = await db.enrollments.findOne({
      where: { user_id, course_id, status: "active" },
      raw: true,
    });

    if (!row) {
      return res.status(403).json({ ok: false, error: "NOT_ENROLLED" });
    }

    req.enrollment = row;
    return next();
  } catch (e) {
    return next(e);
  }
}

module.exports = { ensureEnrolled };
