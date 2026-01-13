import client from '../../core/api/client';

// Types
export interface CourseVersion {
    version_id: number;
    course_id: number;
    version_number: number;
    instructor_id: number;
    status: 'Draft' | 'Published' | 'Archived';
    created_at?: string;
    updated_at?: string;
}

// Helper to extract data from API response { ok: boolean, data: T }
function extractData<T>(response: { data: { ok: boolean; data: T } | T }): T {
    const d = response.data as any;
    if (d && typeof d === 'object' && 'ok' in d && 'data' in d) {
        return d.data;
    }
    return d;
}

// API Functions
export async function listVersions(courseId: number | string): Promise<CourseVersion[]> {
    const res = await client.get(`/courses/${courseId}/versions`);
    return extractData(res);
}

export async function createDraft(courseId: number | string): Promise<CourseVersion> {
    const res = await client.post(`/courses/${courseId}/versions`);
    return extractData(res);
}

export async function publishVersion(courseId: number | string, versionId: number | string): Promise<CourseVersion> {
    const res = await client.post(`/courses/${courseId}/versions/${versionId}/publish`);
    return extractData(res);
}

export async function rollbackVersion(courseId: number | string, versionId: number | string): Promise<CourseVersion> {
    const res = await client.post(`/courses/${courseId}/versions/${versionId}/rollback`);
    return extractData(res);
}

export async function archiveVersion(courseId: number | string, versionId: number | string): Promise<CourseVersion> {
    const res = await client.post(`/courses/${courseId}/versions/${versionId}/archive`);
    return extractData(res);
}

export const courseVersionsApi = {
    listVersions,
    createDraft,
    publishVersion,
    rollbackVersion,
    archiveVersion,
};
