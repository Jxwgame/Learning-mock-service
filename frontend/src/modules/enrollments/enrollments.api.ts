import client from "@/core/api/client";

// ==================== Types ====================

export interface Enrollment {
    enrollment_id: number;
    user_id: number;
    course_id: number;
    status: "active" | "completed" | "cancelled";
    enrolled_at: string;
    completed_at?: string | null;
    // Course details (included from JOIN)
    course_name?: string;
    description?: string;
    year?: number;
    cover_image_url?: string;
}

export interface EnrolledCourse extends Enrollment {
    course_name?: string;
    description?: string;
}

export interface EnrollCourseResult {
    enrollment_id: number;
    old_status: string | null;
    new_status: string;
    changed: boolean;
}

export interface CourseContentResult {
    course_id: number;
    version_id: number;
}

// ==================== API Functions ====================

function extractData<T>(response: { data: { ok: boolean; data: T } | T }): T {
    const d = response.data as any;
    if (d && typeof d === "object" && "ok" in d && "data" in d) {
        return d.data;
    }
    return d;
}

// Enroll current user in a course || POST /enrollments/courses/:id/enroll
export async function enrollCourse(courseId: number): Promise<EnrollCourseResult> {
    const response = await client.post(`/enrollments/courses/${courseId}/enroll`);
    return extractData(response);
}

// List all courses the current user is enrolled in || GET /enrollments/me/courses
export async function getMyCourses(): Promise<Enrollment[]> {
    const response = await client.get("/enrollments/me/courses");
    return extractData(response);
}

// Get course content (requires enrollment) || GET /enrollments/courses/:id/content
export async function getCourseContent(courseId: number): Promise<CourseContentResult> {
    const response = await client.get(`/enrollments/courses/${courseId}/content`);
    return extractData(response);
}

// Check if user is enrolled in a specific course || (Uses getMyCourses and filters locally)
export async function isEnrolledInCourse(courseId: number): Promise<boolean> {
    try {
        const courses = await getMyCourses();
        return courses.some(c => c.course_id === courseId && c.status === "active");
    } catch {
        return false;
    }
}

// Unenroll (cancel) from a course || DELETE /enrollments/courses/:id/enroll
export async function unenrollCourse(courseId: number): Promise<EnrollCourseResult> {
    const response = await client.delete(`/enrollments/courses/${courseId}/enroll`);
    return extractData(response);
}

// ==================== Export Object ====================

export const enrollmentsApi = {
    enrollCourse,
    getMyCourses,
    getCourseContent,
    isEnrolledInCourse,
    unenrollCourse,
};
