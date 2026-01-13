const express = require("express");
const { authRequired } = require("../../core/middlewares/authRequired");
const { requirePermission } = require("../../core/middlewares/requirePermission");
const { idempotency } = require("../../core/middlewares/idempotency");
const { rateLimit } = require("../../core/middlewares/rateLimit");
const validate = require("../../core/middlewares/validate");
const {
  courseParamsSchema,
  courseVersionParamsSchema,
} = require("./courseVersions.validation");

const controller = require("./courseVersions.controller");

const router = express.Router();

router.get(
  "/courses/:courseId/versions",
  authRequired,
  requirePermission("course.version.read"),
  validate(courseParamsSchema, "params"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:courseVersions:list" }),
  controller.listVersions
);

router.post(
  "/courses/:courseId/versions",
  authRequired,
  requirePermission("course.version.create"),
  validate(courseParamsSchema, "params"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 30, keyPrefix: "rl:courseVersions:create" }),
  controller.createDraft
);

router.post(
  "/courses/:courseId/versions/:versionId/publish",
  authRequired,
  requirePermission("course.version.publish"),
  validate(courseVersionParamsSchema, "params"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 30, keyPrefix: "rl:courseVersions:publish" }),
  controller.publishVersion
);

router.post(
  "/courses/:courseId/versions/:versionId/rollback",
  authRequired,
  requirePermission("course.version.rollback"),
  validate(courseVersionParamsSchema, "params"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 30, keyPrefix: "rl:courseVersions:rollback" }),
  controller.rollbackToVersion
);

router.post(
  "/courses/:courseId/versions/:versionId/archive",
  authRequired,
  requirePermission("course.version.archive"),
  validate(courseVersionParamsSchema, "params"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 30, keyPrefix: "rl:courseVersions:archive" }),
  controller.archiveVersion
);

module.exports = router;
