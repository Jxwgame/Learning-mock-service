// src/app/router.ts
import { createRouter, createWebHistory } from "vue-router";
import { ref } from "vue";
import { useAuthStore } from "../modules/auth/auth.store";

import Login from "../modules/auth/auth/login/Login.vue";
import MfaChallenge from "../modules/auth/auth/mfa/MfaChallenge.vue";

const PlaceholderPage = {
    template: `
    <div class="backoffice-layout">
      <Navsidebar />
      <TopNavbar />
      <main class="main-content">
        <div class="placeholder-page">
          <i class="fas fa-hard-hat" style="font-size: 4rem; color: #f59e0b; margin-bottom: 1rem;"></i>
          <h1>{{ $route.meta.title || 'หน้านี้กำลังพัฒนา' }}</h1>
          <p>กรุณารอสักครู่ เรากำลังพัฒนาฟีเจอร์นี้</p>
          <router-link to="/" class="back-btn">
            <i class="fas fa-arrow-left"></i> กลับหน้าหลัก
          </router-link>
        </div>
      </main>
    </div>
  `,
    components: {
        Navsidebar: () => import("../components/Navsidebar.vue"),
        TopNavbar: () => import("../components/TopNavbar.vue"),
    },
    setup() {
        const isSidebarCollapsed = ref(false);
        const isMobileSidebarOpen = ref(false);

        const toggleSidebar = () => {
            isSidebarCollapsed.value = !isSidebarCollapsed.value;
        };

        const toggleMobileSidebar = () => {
            isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
        };

        const closeMobileSidebar = () => {
            isMobileSidebarOpen.value = false;
        };

        return {
            isSidebarCollapsed,
            isMobileSidebarOpen,
            toggleSidebar,
            toggleMobileSidebar,
            closeMobileSidebar
        };
    }
};

// SECURITY NOTE:
// Routes with `roles` in meta are strictly restricted to those roles.
// Routes without `roles` are accessible to ALL active users (including learners).
const routes = [
    // ===========================
    // Public Routes
    // ===========================
    {
        path: "/login",
        name: "login",
        component: Login,
        meta: { public: true },
    },
    {
        path: "/mfa",
        name: "mfa",
        component: MfaChallenge,
        meta: { public: true, requiresMfa: true },
    },

    // ===========================
    // Core / Dashboard
    // ===========================
    {
        path: "/",
        name: "home",
        component: () => import("../modules/auth/home/BackOfficeHome.vue"),
        meta: { requiresAuth: true, title: "หน้าหลัก", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/learner-home",
        name: "learner-home",
        component: () => import("../modules/auth/home/LearnerHome.vue"),
        meta: { requiresAuth: true, title: "หน้าแรกผู้เรียน", roles: ["learner"] },
    },
    {
        path: "/profile",
        name: "profile",
        component: () => import("../modules/me/pages/ProfilePage.vue"),
        meta: { requiresAuth: true, title: "โปรไฟล์ของฉัน" },
    },
    {
        path: "/settings",
        name: "settings",
        component: PlaceholderPage,
        meta: { requiresAuth: true, title: "ตั้งค่าบัญชี" },
    },
    {
        path: "/reports",
        name: "reports",
        component: () => import("../modules/admin/pages/ReportsPage.vue"),
        meta: { requiresAuth: true, title: "รายงาน", roles: ["admin", "super_admin"] },
    },

    // ===========================
    // Learning (Learner View)
    // ===========================
    {
        path: "/my-courses",
        name: "my-courses",
        component: () => import("../modules/enrollments/pages/MyCoursePage.vue"),
        meta: { requiresAuth: true, title: "คอร์สของฉัน" },
    },
    {
        path: "/my-assignments",
        name: "my-assignments",
        component: () => import("../modules/enrollments/pages/MyAssignmentsPage.vue"),
        meta: { requiresAuth: true, title: "แบบฝึกหัดของฉัน" },
    },
    {
        path: "/enroll",
        redirect: "/courses", // Redirect legacy enroll page to main courses list
    },
    {
        path: "/learning/:courseId",
        name: "learning-list",
        component: () => import("../modules/enrollments/pages/MyLessonsList.vue"),
        meta: { requiresAuth: true, title: "บทเรียน" },
    },
    {
        path: "/learning/:courseId/lessons/:lessonId",
        name: "learning-detail",
        component: () => import("../modules/enrollments/pages/MyLessonsDetail.vue"),
        meta: { requiresAuth: true, title: "เนื้อหาบทเรียน" },
    },
    {
        path: "/learning/:courseId/assignments/:assignmentId",
        name: "assignment-detail",
        component: () => import("../modules/enrollments/pages/AssignmentDetail.vue"),
        meta: { requiresAuth: true, title: "แบบฝึกหัด" },
    },

    // ===========================
    // Grading (Instructor/Admin)
    // ===========================
    {
        path: "/grading",
        name: "grading",
        component: () => import("../modules/grading/GradingList.vue"),
        meta: { requiresAuth: true, title: "ตรวจงาน", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/grading/:assignmentId/submissions/:submissionId",
        name: "grading-detail",
        component: () => import("../modules/grading/GradingDetail.vue"),
        meta: { requiresAuth: true, title: "ตรวจงาน", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/grading/assignment/:assignmentId",
        name: "grading-assignment-list",
        component: () => import("../modules/grading/GradingList.vue"),
        meta: { requiresAuth: true, title: "รายการส่งงาน", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/assignments",
        name: "assignments-dashboard",
        component: () => import("../modules/assignments/pages/AssignmentsDashboard.vue"),
        meta: { requiresAuth: true, title: "จัดการแบบฝึกหัด", roles: ["admin", "instructor", "super_admin"] },
    },

    // ===========================
    // Course Management (Instructor/Admin)
    // ===========================
    {
        path: "/courses",
        name: "courses",
        component: () => import("../modules/courses/pages/CoursesList.vue"),
        meta: { requiresAuth: true, title: "รายการคอร์ส" },
    },
    {
        path: "/courses/detail/:id",
        name: "course-detail",
        component: () => import("../modules/courses/pages/CoursesDetail.vue"),
        meta: { requiresAuth: true, title: "รายละเอียดคอร์ส" },
    },
    {
        path: "/courses/manage",
        name: "course-management",
        component: () => import("../modules/courses/pages/CoursesManagement.vue"),
        meta: { requiresAuth: true, title: "จัดการคอร์ส", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/courses/create",
        name: "courses-create",
        component: () => import("../modules/courses/pages/CourseCreate.vue"),
        meta: { requiresAuth: true, title: "สร้างคอร์ส", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/courses/edit/:id",
        name: "courses-edit",
        component: () => import("../modules/courses/pages/CourseEdit.vue"),
        meta: { requiresAuth: true, title: "แก้ไขคอร์ส", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/courses/instructor/:id",
        name: "courses-instructor-detail",
        component: () => import("../modules/courses/pages/CoursesDetailInstructor.vue"),
        meta: { requiresAuth: true, title: "จัดการคอร์ส (ผู้สอน)", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/courses/teaching",
        name: "courses-teaching",
        component: () => import("../modules/courses/pages/CoursesTeachingList.vue"),
        meta: { requiresAuth: true, title: "คอร์สที่ฉันสอน", roles: ["admin", "instructor", "super_admin"] },
    },
    // Lessons routes removed as they are handled in Course Detail

    // Assignment Routes
    // Removed broken standalone route pointing to dumb component

    // Global Assignment Dashboard Routes
    {
        path: "/assignments",
        name: "assignments-dashboard",
        component: () => import("../modules/assignments/pages/AssignmentsDashboard.vue"),
        meta: { requiresAuth: true, title: "ภาพรวมแบบฝึกหัด" },
    },
    {
        path: "/assignments/submit",
        name: "assignments-submit-dashboard",
        component: () => import("../modules/assignments/pages/AssignmentsDashboard.vue"),
        meta: { requiresAuth: true, title: "ส่งงาน (รวม)" },
    },
    {
        path: "/assignments/grade",
        name: "assignments-grade-dashboard",
        component: () => import("../modules/assignments/pages/AssignmentsDashboard.vue"),
        meta: { requiresAuth: true, title: "ตรวจงาน (รวม)" },
    },
    {
        // For Learner to view/submit
        path: "/learning/:courseId/assignments/:assignmentId",
        name: "assignment-detail",
        component: () => import("../modules/assignments/pages/AssignmentDetail.vue"),
        meta: { requiresAuth: true, title: "แบบฝึกหัด" },
    },
    {
        // For Instructor to grade/manage specific one
        path: "/courses/:courseId/assignments/:assignmentId",
        name: "instructor-assignment-detail",
        component: () => import("../modules/assignments/pages/AssignmentDetail.vue"),
        meta: { requiresAuth: true, title: "ตรวจงานแบบฝึกหัด", roles: ["admin", "instructor", "super_admin"] },
    },
    {
        path: "/instructors",
        name: "instructors",
        component: () => import("../modules/courses/pages/CourseInstructorsList.vue"),
        meta: { requiresAuth: true, title: "รายชื่อผู้สอน (ทั้งหมด)", roles: ['admin', 'super_admin'] },
    },

    // ===========================
    // Admin & System
    // ===========================
    {
        path: "/users",
        name: "users",
        component: () => import("../modules/admin/pages/UserManagementAll.vue"),
        meta: { requiresAuth: true, title: "จัดการผู้ใช้", roles: ["admin", "super_admin"] },
    },
    {
        path: "/users/:userId",
        name: "user-detail",
        component: () => import("../modules/admin/pages/UserDetailPage.vue"),
        meta: { requiresAuth: true, title: "รายละเอียดผู้ใช้", roles: ["admin", "super_admin"] },
    },
    // Note: Security Page removed as functionality moved to UserDetailPage
    // but leaving route placeholder if needed for redirection logic or pure admin dashboard later
    /* 
    {
        path: "/admin/security",
        name: "admin-security",
        component: () => import("../modules/admin/pages/SecurityPage.vue"),
        meta: { requiresAuth: true, title: "Security & Access" },
    }, 
    */
    {
        path: "/reports",
        name: "reports",
        component: () => import("../modules/admin/pages/ReportsPage.vue"),
        meta: { requiresAuth: true, title: "รายงานภาพรวม", roles: ['admin', 'super_admin'] },
    },
    {
        path: "/logs",
        name: "logs",
        component: () => import("../modules/admin/pages/LogsPage.vue"),
        meta: { requiresAuth: true, title: "System Logs", roles: ['admin', 'super_admin'] },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0, behavior: 'smooth' };
        }
    },
});

/* ================= Router Guard ================= */
router.beforeEach(async (to) => {
    const auth = useAuthStore();

    if (!auth.isInitialized) {
        console.log("[Router] Auth not initialized, calling init()...");
        await auth.init();
        console.log("[Router] Auth init done. IsAuthenticated:", auth.isAuthenticated);
    }

    if (auth.isMfaRequired && to.name !== "mfa") {
        return { name: "mfa" };
    }

    if (to.name === "mfa") {
        if (!auth.isMfaRequired) {
            return { name: "login" };
        }
        return true;
    }

    if (to.meta.public) {
        return true;
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: "login" };
    }

    if (to.meta.roles && Array.isArray(to.meta.roles)) {
        const userRoles = (auth.user?.roles || []).map(r => r.toLowerCase());
        const allowedRoles = (to.meta.roles as string[]).map(r => r.toLowerCase());
        const hasRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRole) {
            // If user is a Learner, redirect to Learner Home
            if (userRoles.includes('learner')) {
                if (to.name !== 'learner-home') {
                    return { name: "learner-home" };
                }
                return { name: "login" };
            }

            // If user is Admin/Instructor, redirect to Main Home
            const isBackOffice = userRoles.some(r => ['admin', 'super_admin', 'instructor'].includes(r));
            if (isBackOffice) {
                if (to.name !== 'home') {
                    return { name: "home" };
                }
                return { name: "login" };
            }

            return { name: "login" };
        }
    }

    return true;
});

export default router;

