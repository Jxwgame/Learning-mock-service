const express = require("express");
const { authRequired } = require("../../core/middlewares/authRequired");
const { requirePermission } = require("../../core/middlewares/requirePermission");
const { idempotency } = require("../../core/middlewares/idempotency");
const { rateLimit } = require("../../core/middlewares/rateLimit");
const validate = require("../../core/middlewares/validate");
const {
  createAssignmentSchema,
  updateAssignmentSchema,
  createSubmissionSchema,
  gradeSubmissionSchema,
} = require("./assignments.validation");

const controller = require("./assignments.controller");

const router = express.Router();

// READ published (Learner/Instructor/Admin): based on courses.active_published_version_id

router.get(
  "/courses/:courseId/assignments",
  authRequired,
  requirePermission("course.read"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:assignments:listPublished" }),
  controller.listPublishedAssignments
);

router.get(
  "/assignments/:assignmentId",
  authRequired,
  requirePermission("course.read"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:assignments:get" }),
  controller.getAssignment
);

// Instructor draft management: assign under a lesson (lesson belongs to draft version)

router.post(
  "/lessons/:lessonId/assignments",
  authRequired,
  requirePermission("assignment.manage"),
  validate(createAssignmentSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 60, keyPrefix: "rl:assignments:create" }),
  controller.createAssignment
);

router.patch(
  "/assignments/:assignmentId",
  authRequired,
  requirePermission("assignment.manage"),
  validate(updateAssignmentSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:assignments:update" }),
  controller.updateAssignment
);

router.delete(
  "/assignments/:assignmentId",
  authRequired,
  requirePermission("assignment.manage"),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 60, keyPrefix: "rl:assignments:delete" }),
  controller.deleteAssignment
);

// Learner submit (published only): submit file_url/text

router.post(
  "/assignments/:assignmentId/submissions",
  authRequired,
  requirePermission("assignment.submit"),
  validate(createSubmissionSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:submissions:create" }),
  controller.createSubmission
);

// Learner view own submissions
router.get(
  "/assignments/:assignmentId/submissions/me",
  authRequired,
  requirePermission("course.read"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:submissions:me" }),
  controller.listMySubmissions
);

// Instructor view submissions for grading (draft/published ok, but must course they teach)

router.get(
  "/assignments/:assignmentId/submissions",
  authRequired,
  requirePermission("grading.manage"),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:submissions:list" }),
  controller.listSubmissionsForAssignment
);

router.patch(
  "/submissions/:submissionId/grade",
  authRequired,
  requirePermission("grading.manage"),
  validate(gradeSubmissionSchema),
  idempotency({ ttlSec: 600 }),
  rateLimit({ windowSec: 60, max: 120, keyPrefix: "rl:submissions:grade" }),
  controller.gradeSubmission
);

module.exports = router;
