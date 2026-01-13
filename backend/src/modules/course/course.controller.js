const service = require("./course.service");
const { assertCanAccessCourse } = require("./course.policy")

async function createCourse(req, res, next) {
  try {
    const result = await service.createCourse({
      actor_user_id: req.user.user_id,
      payload: req.body,
      request_id: req.requestId,
    });
    return res.status(201).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
}

async function updateCourse(req, res, next) {
  try {
    const hasAdminAccess = typeof req.user?.can === 'function'
      ? req.user.can('course.manage_all') || req.user.can('admin.access')
      : ((req.user?.roles || []).map(r => String(r).toLowerCase()).some(r => r === 'admin' || r === 'super_admin'));

    const payload = { ...req.body };

    // If not admin, remove restricted fields to prevent unauthorized updates
    if (!hasAdminAccess) {
      delete payload.course_name;
      delete payload.code;
      delete payload.year;
      delete payload.description;
    }

    const result = await service.updateCourse({
      actor_user_id: req.user.user_id,
      course_id: Number(req.params.courseId),
      payload,
      request_id: req.requestId,
    });
    return res.json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
}

async function getCourse(req, res, next) {
  try {
    const course_id = Number(req.params.courseId);
    await assertCanAccessCourse({ req, course_id });

    const course = await service.getCourse({ course_id });
    return res.json({ ok: true, data: course });
  } catch (e) {
    next(e);
  }
}

async function listCourses(req, res, next) {
  try {
    const result = await service.listCourses({
      year: req.query.year ? Number(req.query.year) : null,
      q: req.query.q ? String(req.query.q) : null,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    });
    return res.json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const result = await service.deleteCourse({
      actor_user_id: req.user.user_id,
      course_id: Number(req.params.courseId),
      request_id: req.requestId,
    });
    return res.json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
}

async function uploadCoverImage(req, res, next) {
  try {
    const course_id = Number(req.params.courseId);
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "NO_FILE_UPLOADED" });
    }

    // Build the URL path for the uploaded file
    const cover_image_url = `/uploads/courses/${req.file.filename}`;

    // Update course with the new cover image URL
    const result = await service.updateCourse({
      actor_user_id: req.user.user_id,
      course_id,
      payload: { cover_image_url },
      request_id: req.requestId,
    });

    return res.json({ ok: true, data: { cover_image_url: result.cover_image_url } });
  } catch (e) {
    next(e);
  }
}

module.exports = { createCourse, updateCourse, getCourse, listCourses, deleteCourse, uploadCoverImage };