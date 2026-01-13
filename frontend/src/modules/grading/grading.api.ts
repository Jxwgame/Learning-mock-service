import client from '@/core/api/client';

// ==================== Types ====================

export interface Submission {
    submission_id: number;
    assignment_id: number;
    user_id: number;
    submission_date: string;
    file_url?: string;
    content?: string;
    grade?: number;
    feedback?: string;
    graded_by?: number;
    graded_at?: string;
    status: 'submitted' | 'graded';
    // User info (from JOIN)
    user_email?: string;
    user_first_name?: string;
    user_last_name?: string;
}

export interface Assignment {
    assignment_id: number;
    lesson_id: number;
    course_id?: number;
    course_name?: string;
    lesson_title?: string;
    title: string;
    description?: string;
    due_date?: string;
    max_score: number;
}

export interface GradePayload {
    grade: number;
    feedback?: string;
}

// ==================== Helper ====================

function extractData<T>(response: { data: { ok: boolean; data: T } | T }): T {
    const d = response.data as any;
    if (d && typeof d === 'object' && 'ok' in d && 'data' in d) {
        return d.data;
    }
    return d;
}

// ==================== API Functions ====================

// List all submissions for an assignment (Instructor view) || GET /assignments/:assignmentId/submissions
export async function listSubmissions(assignmentId: number | string): Promise<Submission[]> {
    const res = await client.get(`/assignments/${assignmentId}/submissions`);
    return extractData(res);
}

// Grade a submission || PATCH /submissions/:submissionId/grade
export async function gradeSubmission(submissionId: number | string, payload: GradePayload): Promise<Submission> {
    const res = await client.patch(`/submissions/${submissionId}/grade`, payload);
    return extractData(res);
}

// Get assignment details || GET /assignments/:assignmentId
export async function getAssignment(assignmentId: number | string): Promise<Assignment> {
    const res = await client.get(`/assignments/${assignmentId}`);
    return extractData(res);
}

// List assignments for a course (for instructor to see which ones have submissions) || GET /courses/:courseId/assignments
export async function listCourseAssignments(courseId: number | string): Promise<Assignment[]> {
    const res = await client.get(`/courses/${courseId}/assignments`);
    return extractData(res);
}

// ==================== Export ====================

export const gradingApi = {
    listSubmissions,
    gradeSubmission,
    getAssignment,
    listCourseAssignments,
};
