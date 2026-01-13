import { defineStore } from 'pinia';
import { ref } from 'vue';
import { lessonsApi, type Lesson, type LessonContent, type CreateLessonPayload, type CreateContentPayload } from './lessons.api';

export const useLessonsStore = defineStore('lessons', () => {
    const lessons = ref<Lesson[]>([]);
    const currentLesson = ref<Lesson | null>(null);
    const lessonContents = ref<LessonContent[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Lessons
    async function fetchLessons(courseId: number | string, versionId: number | string) {
        loading.value = true;
        try {
            const data = await lessonsApi.listLessons(courseId, versionId);
            lessons.value = data || [];
        } catch (e: any) {
            error.value = e.message;
            lessons.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function createLesson(courseId: number | string, versionId: number | string, payload: CreateLessonPayload) {
        const lesson = await lessonsApi.createLesson(courseId, versionId, payload);
        if (!Array.isArray(lessons.value)) {
            lessons.value = [];
        }
        lessons.value.push(lesson);
        return lesson;
    }

    async function updateLesson(lessonId: number | string, payload: Partial<CreateLessonPayload>) {
        const updated = await lessonsApi.updateLesson(lessonId, payload);
        const idx = lessons.value.findIndex(l => l && l.lesson_id === Number(lessonId));
        if (idx !== -1) lessons.value[idx] = updated;
        return updated;
    }

    async function deleteLesson(lessonId: number | string) {
        await lessonsApi.deleteLesson(lessonId);
        lessons.value = lessons.value.filter(l => l.lesson_id !== Number(lessonId));
    }

    // Contents
    async function fetchContents(lessonId: number | string) {
        lessonContents.value = await lessonsApi.listLessonContents(lessonId);
    }

    async function addContent(lessonId: number | string, payload: CreateContentPayload) {
        const content = await lessonsApi.addLessonContent(lessonId, payload);
        lessonContents.value.push(content);
        return content;
    }

    async function updateContent(contentId: number | string, payload: Partial<CreateContentPayload>) {
        const updated = await lessonsApi.updateLessonContent(contentId, payload);
        const idx = lessonContents.value.findIndex(c => c.content_id === Number(contentId));
        if (idx !== -1) lessonContents.value[idx] = updated;
        return updated;
    }

    async function deleteContent(contentId: number | string) {
        await lessonsApi.deleteLessonContent(contentId);
        lessonContents.value = lessonContents.value.filter(c => c.content_id !== Number(contentId));
    }

    return {
        lessons,
        currentLesson,
        lessonContents,
        loading,
        error,
        fetchLessons,
        createLesson,
        updateLesson,
        deleteLesson,
        fetchContents,
        addContent,
        updateContent,
        deleteContent,
    };
});
