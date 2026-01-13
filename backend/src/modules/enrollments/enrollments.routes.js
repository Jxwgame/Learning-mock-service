const express = require("express");
const { authRequired } = require("../../core/middlewares/authRequired");
const {
  requirePermission,
} = require("../../core/middlewares/requirePermission");
const controller = require("./enrollments.controller");
const { ensureEnrolled } = require("../../core/middlewares/ensureEnrolled");
const validate = require("../../core/middlewares/validate");
const { enrollmentParamsSchema } = require("./enrollments.validation");

const router = express.Router();

// POST /courses/:id/enroll
router.post(
  "/courses/:id/enroll",
  authRequired,
  requirePermission("enrollment.create"),
  validate(enrollmentParamsSchema, "params"),
  controller.enroll
);

// DELETE /courses/:id/enroll - Self-unenroll (no permission needed, just auth)
router.delete(
  "/courses/:id/enroll",
  authRequired,
  validate(enrollmentParamsSchema, "params"),
  controller.unenroll
);

// GET /me/courses
router.get(
  "/me/courses",
  authRequired,
  requirePermission("enrollment.read"),
  controller.listMyCourses
);

// GET /courses/:id/content
router.get(
  "/courses/:id/content",
  authRequired,
  validate(enrollmentParamsSchema, "params"),
  ensureEnrolled,
  controller.getCourseContent
);

module.exports = router;
