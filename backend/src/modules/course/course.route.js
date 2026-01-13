const express = require("express");
const { authRequired } = require("../../core/middlewares/authRequired");
const { requirePermission } = require("../../core/middlewares/requirePermission");
const { idempotency } = require("../../core/middlewares/idempotency");
const { rateLimit } = require("../../core/middlewares/rateLimit");
const { upload } = require("../../core/middlewares/upload");
const validate = require("../../core/middlewares/validate");
const { createCourseSchema, updateCourseSchema } = require("./course.validation");

const controller = require("./course.controller");

const router = express.Router();

// list
router.get(
  "/",
  authRequired,
  requirePermission("course.read"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:courses:list" }),
  controller.listCourses
);

// detail
router.get(
  "/:courseId",
  authRequired,
  requirePermission("course.read"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:courses:detail" }),
  controller.getCourse
);

// create (admin)
router.post(
  "/",
  authRequired,
  requirePermission("course.create"),
  validate(createCourseSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 30, keyPrefix: "rl:courses:create" }),
  controller.createCourse
);

// update (admin)
router.patch(
  "/:courseId",
  authRequired,
  requirePermission("course.update"),
  validate(updateCourseSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 60, keyPrefix: "rl:courses:update" }),
  controller.updateCourse
);

// upload cover image
router.post(
  "/:courseId/cover",
  authRequired,
  requirePermission("course.update"),
  upload.single("cover_image"),
  controller.uploadCoverImage
);

// delete (admin)
router.delete(
  "/:courseId",
  authRequired,
  requirePermission("course.delete"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 30, keyPrefix: "rl:courses:delete" }),
  controller.deleteCourse
);

module.exports = router;

