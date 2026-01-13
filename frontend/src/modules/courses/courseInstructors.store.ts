import { defineStore } from 'pinia';
import { ref } from 'vue';
import { courseInstructorsApi, type CourseInstructor } from './courseInstructors.api';

export const useCourseInstructorsStore = defineStore('courseInstructors', () => {
    const instructors = ref<CourseInstructor[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchInstructors(courseId: number | string) {
        loading.value = true;
        error.value = null;
        try {
            instructors.value = await courseInstructorsApi.listInstructors(courseId);
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch instructors';
            instructors.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function addInstructor(courseId: number | string, userId: number | string) {
        await courseInstructorsApi.assignInstructor(courseId, userId);
        await fetchInstructors(courseId);
    }

    async function removeInstructor(courseId: number | string, instructorId: number | string) {
        await courseInstructorsApi.revokeInstructor(courseId, instructorId);
        instructors.value = instructors.value.filter(i => i.user_id !== Number(instructorId));
    }

    async function syncInstructors(courseId: number | string, newInstructors: any[]) {
        loading.value = true;
        try {
            await courseInstructorsApi.syncInstructors(courseId, newInstructors);
            instructors.value = await courseInstructorsApi.listInstructors(courseId);
        } catch (e: any) {
            error.value = e.message || 'Failed to sync instructors';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    const myTeachingCourses = ref<any[]>([]);

    async function fetchMyTeachingCourses() {
        loading.value = true;
        try {
            myTeachingCourses.value = await courseInstructorsApi.getMyTeachingCourses();
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch my teaching courses';
            myTeachingCourses.value = [];
        } finally {
            loading.value = false;
        }
    }

    return {
        instructors,
        loading,
        error,
        fetchInstructors,
        addInstructor,
        removeInstructor,
        syncInstructors,
        myTeachingCourses,
        fetchMyTeachingCourses,
    };
});
