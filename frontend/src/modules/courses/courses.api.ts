import client from "@/core/api/client";

export interface Course {
    course_id: number;
    course_name: string;
    description?: string;
    year?: number;
    cover_image_url?: string;
    created_by?: number;
    active_published_version_id?: number | null;
    created_at?: string;
    updated_at?: string;
    enrollment_count?: number;
}

export interface CourseVersion {
    version_id: number;
    course_id: number;
    version_number: number;
    instructor_id?: number;
    status: 'Draft' | 'Published' | 'Archived';
    created_at?: string;
    updated_at?: string;
}

export interface Lesson {
    lesson_id: number;
    course_id: number;
    version_id: number;
    lesson_title: string;
    lesson_content?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CourseListItem extends Course {
    instructor_name?: string;
    enrollment_count?: number;
    version_count?: number;
}

export interface CreateCoursePayload {
    course_name: string;
    description?: string;
    year: number;
}

// Helper to extract data from API response { ok: boolean, data: T }
function extractData<T>(response: { data: { ok: boolean; data: T } | T }): T {
    const d = response.data as any;
    // Handle both wrapped { ok, data } and direct array/object responses
    if (d && typeof d === 'object' && 'ok' in d && 'data' in d) {
        return d.data;
    }
    return d;
}

// Fetch list of all active courses
export async function getCourses(): Promise<CourseListItem[]> {
    const response = await client.get("/courses");
    return extractData(response);
}

// Fetch single course detail by ID
export async function getCourseById(id: number | string): Promise<Course> {
    const response = await client.get(`/courses/${id}`);
    return extractData(response);
}

// Manage course (Admin/Instructor view) || Uses the same endpoint as getCourses - filtering should be done by permissions on backend
export async function getManagedCourses(): Promise<CourseListItem[]> {
    const response = await client.get("/courses");
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
}

// Create a new course
export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
    const response = await client.post("/courses", payload);
    return extractData(response);
}

// Update an existing course
export async function updateCourse(id: number | string, payload: Partial<CreateCoursePayload>): Promise<Course> {
    const response = await client.patch(`/courses/${id}`, payload);
    return extractData(response);
}

// Delete a course
export async function deleteCourse(id: number | string): Promise<void> {
    await client.delete(`/courses/${id}`);
}

export const coursesApi = {
    getCourses,
    getCourseById,
    getManagedCourses,
    createCourse,
    updateCourse,
    deleteCourse,
};
