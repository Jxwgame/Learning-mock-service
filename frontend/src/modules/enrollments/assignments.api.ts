import client from '@/core/api/client';

export interface Assignment {
    assignment_id: number;
    lesson_id: number;
    title: string;
    description?: string;
    due_date?: string;
    max_score: number;
    created_at?: string;
    updated_at?: string;
}

export interface AssignmentSubmission {
    submission_id: number;
    assignment_id: number;
    user_id: number;
    submitted_at: string;
    file_url?: string;
    content?: string;
    grade?: number;
    feedback?: string;
    graded_by?: number;
    graded_at?: string;
    status: 'submitted' | 'graded';
}

export interface CreateSubmissionPayload {
    file_url?: string;
    content?: string;
}

// Helper to extract data from API response
function extractData<T>(response: { data: { ok: boolean; data: T } | T }): T {
    const d = response.data as any;
    if (d && typeof d === 'object' && 'ok' in d && 'data' in d) {
        return d.data;
    }
    return d;
}

/**
 * List published assignments for a course (active version)
 */
export async function listPublishedAssignments(courseId: number | string): Promise<Assignment[]> {
    const res = await client.get(`/courses/${courseId}/assignments`);
    return extractData(res);
}

/**
 * Submit an assignment
 */
export async function createSubmission(assignmentId: number | string, payload: CreateSubmissionPayload): Promise<AssignmentSubmission> {
    const res = await client.post(`/assignments/${assignmentId}/submissions`, payload);
    return extractData(res);
}

/**
 * Get my submissions for an assignment
 */
export async function getMySubmissions(assignmentId: number | string): Promise<AssignmentSubmission[]> {
    const res = await client.get(`/assignments/${assignmentId}/submissions/me`);
    return extractData(res);
}

export const assignmentsApi = {
    listPublishedAssignments,
    createSubmission,
    getMySubmissions,
};
