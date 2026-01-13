import client from "../../core/api/client";



export interface Assignment {
    assignment_id: number;
    lesson_id: number;
    title: string;
    description: string;
    due_date: string | null;
    max_score: number | null;
    created_at?: string;
    updated_at?: string;
    course_lesson?: {
        lesson_id: number;
        lesson_title: string;
        course_id: number;
        version_id: number;
    };
}

export interface AssignmentSubmission {
    submission_id: number;
    assignment_id: number;
    user_id: number; // learner
    submission_date: string;
    grade: number | null;
    file_url: string | null;
    comments: string | null;
    created_at?: string;
    updated_at?: string;
    // Joins might bring user info
    User?: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface CreateAssignmentDto {
    title: string;
    description?: string;
    due_date?: string | null;
    max_score?: number | null;
}

export interface UpdateAssignmentDto {
    title?: string;
    description?: string;
    due_date?: string | null;
    max_score?: number | null;
}

export interface CreateSubmissionDto {
    file_url?: string;
    comments?: string;
}

export interface GradeSubmissionDto {
    grade: number;
}

function extractData<T>(response: any): T {
    const d = response.data;
    if (d && typeof d === 'object' && 'ok' in d && 'data' in d) {
        return d.data;
    }
    return d as T;
}

export const assignmentsApi = {
    // List published assignments for a course (Learner/Instructor view)
    async listPublishedAssignments(courseId: number): Promise<Assignment[]> {
        const response = await client.get(
            `/courses/${courseId}/assignments`
        );
        return extractData(response);
    },

    // Get single assignment by ID
    async getAssignmentById(assignmentId: number): Promise<Assignment> {
        const response = await client.get(
            `/assignments/${assignmentId}`
        );
        return extractData(response);
    },

    // Create assignment (Instructor) - under a specific lesson
    async createAssignment(
        lessonId: number,
        payload: CreateAssignmentDto
    ): Promise<Assignment> {
        const response = await client.post(
            `/lessons/${lessonId}/assignments`,
            payload
        );
        return extractData(response);
    },

    // Update assignment (Instructor)
    async updateAssignment(
        assignmentId: number,
        payload: UpdateAssignmentDto
    ): Promise<Assignment> {
        const response = await client.patch(
            `/assignments/${assignmentId}`,
            payload
        );
        return extractData(response);
    },

    // Delete assignment (Instructor)
    async deleteAssignment(assignmentId: number): Promise<{ deleted: boolean }> {
        const response = await client.delete(
            `/assignments/${assignmentId}`
        );
        return extractData(response);
    },

    // ================= Submission =================

    // Submit assignment (Learner)
    async createSubmission(
        assignmentId: number,
        payload: CreateSubmissionDto
    ): Promise<AssignmentSubmission> {
        const response = await client.post(
            `/assignments/${assignmentId}/submissions`,
            payload
        );
        return extractData(response);
    },

    // List my submissions (Learner)
    async listMySubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
        const response = await client.get(
            `/assignments/${assignmentId}/submissions/me`
        );
        return extractData(response);
    },

    // List all submissions for an assignment (Instructor)
    async listSubmissionsForAssignment(
        assignmentId: number
    ): Promise<AssignmentSubmission[]> {
        const response = await client.get(
            `/assignments/${assignmentId}/submissions`
        );
        return extractData(response);
    },

    // Grade submission (Instructor)
    async gradeSubmission(
        submissionId: number,
        payload: GradeSubmissionDto
    ): Promise<AssignmentSubmission> {
        const response = await client.patch(
            `/submissions/${submissionId}/grade`,
            payload
        );
        return extractData(response);
    },
};
