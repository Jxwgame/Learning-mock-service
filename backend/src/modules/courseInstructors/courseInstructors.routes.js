const express = require("express");
const { authRequired } = require("../../core/middlewares/authRequired");
const { requirePermission } = require("../../core/middlewares/requirePermission");
const validate = require("../../core/middlewares/validate");
const {
  assignInstructorSchema,
  syncInstructorsSchema,
} = require("./courseInstructors.validation");

const controller = require("./courseInstructors.controller");

const router = express.Router();


router.post(
  "/courses/:courseId/instructors",
  authRequired,
  requirePermission("course.instructor.assign"),
  validate(assignInstructorSchema),
  controller.assignInstructor
);

router.put(
  "/courses/:courseId/instructors",
  authRequired,
  requirePermission("course.instructor.assign"),
  validate(syncInstructorsSchema),
  controller.syncInstructors
);

router.delete(
  "/courses/:courseId/instructors/:instructorId",
  authRequired,
  requirePermission("course.instructor.revoke"),
  controller.revokeInstructor
);

router.get(
  "/courses/:courseId/instructors",
  authRequired,
  requirePermission("course.instructor.read"),
  controller.listCourseInstructors
);

router.get(
  "/me/courses/teaching",
  authRequired,
  requirePermission("course.instructor.read"),
  controller.myTeachingCourses
);

module.exports = router;
