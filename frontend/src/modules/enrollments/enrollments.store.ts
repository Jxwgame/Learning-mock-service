import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
    enrollmentsApi,
    type Enrollment,
    type EnrollCourseResult,
    type CourseContentResult,
} from "./enrollments.api";

export const useEnrollmentsStore = defineStore("enrollments", () => {
    // ==================== State ====================
    const myCourses = ref<Enrollment[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // ==================== Getters ====================
    const enrolledCourseIds = computed(() =>
        myCourses.value
            .filter((e) => e.status === "active")
            .map((e) => e.course_id)
    );

    const isEnrolled = (courseId: number) =>
        enrolledCourseIds.value.includes(courseId);

    // ==================== Actions ====================

    // Fetch all enrolled courses for the current user
    async function fetchMyCourses(): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            myCourses.value = await enrollmentsApi.getMyCourses();
        } catch (e: any) {
            error.value = e.message || "Failed to fetch enrolled courses";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Enroll in a course
    async function enroll(courseId: number): Promise<EnrollCourseResult> {
        loading.value = true;
        error.value = null;
        try {
            const result = await enrollmentsApi.enrollCourse(courseId);
            // Refresh the list after enrolling
            await fetchMyCourses();
            return result;
        } catch (e: any) {
            error.value = e.message || "Failed to enroll in course";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Get course content (for learning page)
    async function getCourseContent(courseId: number): Promise<CourseContentResult> {
        loading.value = true;
        error.value = null;
        try {
            return await enrollmentsApi.getCourseContent(courseId);
        } catch (e: any) {
            error.value = e.message || "Failed to get course content";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Unenroll (cancel) from a course
    async function unenroll(courseId: number): Promise<EnrollCourseResult> {
        loading.value = true;
        error.value = null;
        try {
            const result = await enrollmentsApi.unenrollCourse(courseId);
            // Refresh the list after unenrolling
            await fetchMyCourses();
            return result;
        } catch (e: any) {
            error.value = e.message || "Failed to unenroll from course";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Clear store state (for logout)
    function $reset(): void {
        myCourses.value = [];
        loading.value = false;
        error.value = null;
    }

    return {
        // State
        myCourses,
        loading,
        error,
        // Getters
        enrolledCourseIds,
        isEnrolled,
        // Actions
        fetchMyCourses,
        enroll,
        getCourseContent,
        unenroll,
        $reset,
    };
});
