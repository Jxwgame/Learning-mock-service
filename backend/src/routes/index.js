const express = require("express");
const router = express.Router();

const { authRequired } = require("../core/middlewares/authRequired");
const auditAuth = require("../core/middlewares/auditAuth");

router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/admin", require("../modules/admin/admin.routes"));
router.use("/admin", require("../modules/rbac/routes/userPermissions.routes"));

router.use(authRequired);

router.use("/courses", require("../modules/course/course.route"));
router.use(require("../modules/courseVersions/courseVersions.routes"));
router.use(require("../modules/lessons/lessons.routes"));
router.use(require("../modules/courseInstructors/courseInstructors.routes"));
router.use("/enrollments", require("../modules/enrollments/enrollments.routes"));
router.use(require("../modules/assignments/assignments.routes"));
router.use("/dashboard", require("../modules/dashboard/dashboard.routes"));
router.use("/me", require("../modules/me/me.routes"));
router.use("/admin/logs", require("../modules/logs/logs.routes"));

module.exports = router;
