const repo = require("./dashboard.repo");

const { getRedis } = require("../../config/redis");

async function getDashboardStats() {
    const redis = getRedis();
    const CACHE_KEY = 'dashboard:stats:global';
    const CACHE_TTL = 300; // 5 minutes

    try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        console.error("Redis get error (dashboard):", err);
    }

    const [
        courseCount,
        enrollmentCount,
        instructorCount,
        pendingAssignmentCount,
        recentActivities,
        userCount,
        learnerCount,
        adminCount,
        publishedCourseCount,
        draftCourseCount,
        gradedSubmissionCount,
        topCourses,
        latestEnrollments,
        recentSubmissions
    ] = await Promise.all([
        repo.countCourses(),
        repo.countEnrollments(),
        repo.countInstructors(),
        repo.countPendingAssignments(),
        repo.getRecentActivities(5),
        repo.countUsers(),
        repo.countLearners(),
        repo.countAdmins(),
        repo.countPublishedCourses(),
        repo.countDraftCourses(),
        repo.countGradedSubmissions(),
        repo.getTopCoursesByEnrollment(5),
        repo.getLatestEnrollments(5),
        repo.getRecentSubmissions(5)
    ]);

    const result = {
        courseCount,
        enrollmentCount,
        instructorCount,
        pendingAssignmentCount,
        recentActivities,
        userCount,
        learnerCount,
        adminCount,
        publishedCourseCount,
        draftCourseCount,
        gradedSubmissionCount,
        topCourses,
        latestEnrollments,
        recentSubmissions
    };

    try {
        await redis.set(CACHE_KEY, JSON.stringify(result), { EX: CACHE_TTL });
    } catch (err) {
        console.error("Redis set error (dashboard):", err);
    }

    return result;
}

module.exports = {
    getDashboardStats
};
