const express = require("express");
const { authRequired } = require("../../core/middlewares/authRequired");
const { requirePermission } = require("../../core/middlewares/requirePermission");
const { idempotency } = require("../../core/middlewares/idempotency");
const { rateLimit } = require("../../core/middlewares/rateLimit");
const validate = require("../../core/middlewares/validate");
const {
  createLessonSchema,
  updateLessonSchema,
  lessonContentSchema,
} = require("./lessons.validation");

const controller = require("./lessons.controller");

const router = express.Router();

// published lessons by active version
router.get(
  "/courses/:courseId/lessons",
  authRequired,
  requirePermission("course.read"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessons:listPublished" }),
  controller.listPublishedLessons
);

// published lesson contents
router.get(
  "/courses/:courseId/lessons/:lessonId/contents",
  authRequired,
  requirePermission("course.read"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessonContents:listPublished" }),
  controller.listPublishedLessonContents
);

router.get(
  "/courses/:courseId/versions/:versionId/lessons",
  authRequired,
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessons:list" }),
  controller.listLessons
);

router.get(
  "/lessons/:lessonId/contents",
  authRequired,
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessonContents:list" }),
  controller.listLessonContents
);

// ------- WRITE (Draft-only) -------
router.post(
  "/courses/:courseId/versions/:versionId/lessons",
  authRequired,
  requirePermission("course.content.manage"),
  validate(createLessonSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 60, keyPrefix: "rl:lessons:create" }),
  controller.createLesson
);

router.patch(
  "/lessons/:lessonId",
  authRequired,
  requirePermission("course.content.manage"),
  validate(updateLessonSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessons:update" }),
  controller.updateLesson
);

router.delete(
  "/lessons/:lessonId",
  authRequired,
  requirePermission("course.content.manage"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 60, keyPrefix: "rl:lessons:delete" }),
  controller.deleteLesson
);

router.post(
  "/lessons/:lessonId/contents",
  authRequired,
  requirePermission("course.content.manage"),
  validate(lessonContentSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessonContents:create" }),
  controller.addLessonContent
);

router.patch(
  "/lesson-contents/:contentId",
  authRequired,
  requirePermission("course.content.manage"),
  validate(lessonContentSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessonContents:update" }),
  controller.updateLessonContent
);

router.delete(
  "/lesson-contents/:contentId",
  authRequired,
  requirePermission("course.content.manage"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:lessonContents:delete" }),
  controller.deleteLessonContent
);

module.exports = router;
