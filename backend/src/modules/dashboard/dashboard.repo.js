const db = require("../../database/models");
const { Op, QueryTypes } = require("sequelize");

const Course = db.courses;
const Enrollment = db.enrollments;
const User = db.users;
const Role = db.roles;
const Submission = db.assignment_submissions;
const AuditEvent = db.audit_events;

async function countCourses() {
    return Course.count();
}

async function countEnrollments() {
    return Enrollment.count({
        where: { status: 'active' }
    });
}

async function countInstructors() {
    return User.count({
        include: [{
            model: Role,
            as: 'roles',
            where: { role_name: 'instructor' }
        }]
    });
}

async function countPendingAssignments() {
    return Submission.count({
        where: { status: 'submitted' }
    });
}

async function getRecentActivities(limit = 4) {
    return AuditEvent.findAll({
        limit,
        order: [['created_at', 'DESC']],
        include: [{
            model: User,
            as: 'user',
            attributes: ['first_name', 'last_name', 'email']
        }],
        raw: true,
        nest: true
    });
}

// ===== NEW FUNCTIONS =====

async function countUsers() {
    return User.count();
}

async function countLearners() {
    return User.count({
        include: [{
            model: Role,
            as: 'roles',
            where: { role_name: 'learner' }
        }]
    });
}

async function countAdmins() {
    return User.count({
        include: [{
            model: Role,
            as: 'roles',
            where: { role_name: ['super_admin', 'admin'] }
        }]
    });
}

async function countPublishedCourses() {
    return Course.count({
        where: { active_published_version_id: { [Op.ne]: null } }
    });
}

async function countDraftCourses() {
    return Course.count({
        where: { active_published_version_id: null }
    });
}

async function countGradedSubmissions() {
    return Submission.count({
        where: { status: 'graded' }
    });
}

async function getTopCoursesByEnrollment(limit = 5) {
    const results = await db.sequelize.query(`
        SELECT c.course_id, c.course_name, COUNT(e.enrollment_id) as enrollment_count
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.status = 'active'
        GROUP BY c.course_id
        ORDER BY enrollment_count DESC
        LIMIT :limit
    `, {
        replacements: { limit },
        type: QueryTypes.SELECT
    });
    return results;
}

async function getLatestEnrollments(limit = 5) {
    return Enrollment.findAll({
        limit,
        order: [['enrolled_at', 'DESC']],
        include: [
            { model: User, attributes: ['user_id', 'first_name', 'last_name', 'email'] },
            { model: Course, attributes: ['course_id', 'course_name'] }
        ],
        raw: true,
        nest: true
    });
}

async function getRecentSubmissions(limit = 5) {
    return Submission.findAll({
        limit,
        order: [['submission_date', 'DESC']],
        include: [{
            model: User,
            attributes: ['user_id', 'first_name', 'last_name']
        }],
        raw: true,
        nest: true
    });
}

module.exports = {
    countCourses,
    countEnrollments,
    countInstructors,
    countPendingAssignments,
    getRecentActivities,
    // New exports
    countUsers,
    countLearners,
    countAdmins,
    countPublishedCourses,
    countDraftCourses,
    countGradedSubmissions,
    getTopCoursesByEnrollment,
    getLatestEnrollments,
    getRecentSubmissions
};
