const service = require("./courseInstructors.service");

// Check if user has admin-level course management permission
function hasAdminAccess(req) {
  if (typeof req.user?.can === 'function') {
    return req.user.can('course.manage_all') || req.user.can('admin.access');
  }
  const roles = (req.user?.roles || []).map(r => String(r).toLowerCase());
  return roles.includes('admin') || roles.includes('super_admin');
}

async function assignInstructor(req, res, next) {
  try {
    const data = await service.assignInstructor({
      actor_is_admin: hasAdminAccess(req),
      course_id: Number(req.params.courseId),
      instructor_id: Number(req.body.instructor_id),
      role: req.body.role,
      request_id: req.requestId,
    });
    return res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function revokeInstructor(req, res, next) {
  try {
    const data = await service.revokeInstructor({
      actor_is_admin: hasAdminAccess(req),
      course_id: Number(req.params.courseId),
      instructor_id: Number(req.params.instructorId),
      request_id: req.requestId,
    });
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function listCourseInstructors(req, res, next) {
  try {
    const data = await service.listCourseInstructors({
      actor_user_id: req.user.user_id,
      actor_is_admin: hasAdminAccess(req),
      course_id: Number(req.params.courseId),
    });
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function myTeachingCourses(req, res, next) {
  try {
    const data = await service.myTeachingCourses({
      instructor_id: req.user.user_id,
    });
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function syncInstructors(req, res, next) {
  try {
    const data = await service.syncInstructors({
      actor_user_id: req.user.user_id,
      actor_is_admin: hasAdminAccess(req),
      course_id: Number(req.params.courseId),
      instructors: req.body.instructors || [],
      request_id: req.requestId,
    });
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  assignInstructor,
  revokeInstructor,
  listCourseInstructors,
  myTeachingCourses,
  syncInstructors,
};
