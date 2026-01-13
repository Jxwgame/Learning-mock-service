import client from '../../core/api/client';

// Types
export interface Lesson {
    lesson_id: number;
    course_id: number;
    version_id: number;
    lesson_title: string;
    lesson_content?: string;
    order_index?: number;
    duration?: string | number; // Added for UI compatibility
    created_at?: string;
    updated_at?: string;
}

export interface LessonContent {
    content_id: number;
    lesson_id: number;
    content_type: 'Text' | 'Video' | 'File' | 'Assignment';
    content_text?: string;
    content_file_url?: string;
    file_type?: string;
    sequence_order?: number;
}

export interface CreateLessonPayload {
    lesson_title: string;
    lesson_content?: string;
}

export interface CreateContentPayload {
    content_type: string;
    content_text?: string;
    content_file_url?: string;
    file_type?: string;
}

// Helper to extract data from API response
function extractData<T>(response: any): T {
    // res.data is already unwrapped by client.ts interceptor
    // But we check here for extra safety in case it's not
    const d = response.data;
    if (d && typeof d === "object" && "ok" in d && "data" in d) {
        return d.data;
    }
    return d as T;
}

// Lesson APIs
export async function listLessons(courseId: number | string, versionId: number | string): Promise<Lesson[]> {
    const res = await client.get(`/courses/${courseId}/versions/${versionId}/lessons`);
    return extractData(res);
}

export async function listPublishedLessons(courseId: number | string): Promise<Lesson[]> {
    const res = await client.get(`/courses/${courseId}/lessons`);
    return extractData(res);
}

export async function createLesson(courseId: number | string, versionId: number | string, payload: CreateLessonPayload): Promise<Lesson> {
    const res = await client.post(`/courses/${courseId}/versions/${versionId}/lessons`, payload);
    return extractData(res);
}

export async function updateLesson(lessonId: number | string, payload: Partial<CreateLessonPayload>): Promise<Lesson> {
    const res = await client.patch(`/lessons/${lessonId}`, payload);
    return extractData(res);
}

export async function deleteLesson(lessonId: number | string): Promise<void> {
    await client.delete(`/lessons/${lessonId}`);
}

// Lesson Content APIs
export async function listLessonContents(lessonId: number | string): Promise<LessonContent[]> {
    const res = await client.get(`/lessons/${lessonId}/contents`);
    return extractData(res);
}

export async function addLessonContent(lessonId: number | string, payload: CreateContentPayload): Promise<LessonContent> {
    const res = await client.post(`/lessons/${lessonId}/contents`, payload);
    return extractData(res);
}

export async function updateLessonContent(contentId: number | string, payload: Partial<CreateContentPayload>): Promise<LessonContent> {
    const res = await client.patch(`/lesson-contents/${contentId}`, payload);
    return extractData(res);
}

export async function deleteLessonContent(contentId: number | string): Promise<void> {
    await client.delete(`/lesson-contents/${contentId}`);
}

export const lessonsApi = {
    listLessons,
    listPublishedLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    listLessonContents,
    addLessonContent,
    updateLessonContent,
    deleteLessonContent,
};
