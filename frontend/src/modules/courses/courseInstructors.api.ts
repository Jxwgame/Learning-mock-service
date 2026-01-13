import client from '../../core/api/client';

export interface CourseInstructor {
    user_id: number;
    course_id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    role?: string;
    assigned_at?: string;
}

export async function listInstructors(courseId: number | string): Promise<CourseInstructor[]> {
    const res = await client.get(`/courses/${courseId}/instructors`);
    return Array.isArray(res.data) ? res.data : [];
}

export async function assignInstructor(courseId: number | string, userId: number | string): Promise<void> {
    await client.post(`/courses/${courseId}/instructors`, { instructor_id: userId });
}

export async function revokeInstructor(courseId: number | string, instructorId: number | string): Promise<void> {
    await client.delete(`/courses/${courseId}/instructors/${instructorId}`);
}

export async function syncInstructors(courseId: number | string, instructors: any[]): Promise<void> {
    await client.put(`/courses/${courseId}/instructors`, { instructors });
}

export async function getMyTeachingCourses(): Promise<any[]> {
    const res = await client.get('/me/courses/teaching');
    return Array.isArray(res.data) ? res.data : [];
}

export const courseInstructorsApi = {
    listInstructors,
    assignInstructor,
    revokeInstructor,
    syncInstructors,
    getMyTeachingCourses,
};
