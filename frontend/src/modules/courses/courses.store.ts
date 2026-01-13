import { defineStore } from 'pinia';
import { coursesApi } from './courses.api';
import type { Course, CourseListItem, CreateCoursePayload } from './courses.api';

interface CourseState {
    courses: CourseListItem[];
    managedCourses: CourseListItem[];
    currentCourse: Course | null;
    loading: boolean;
    error: string | null;
}

export const useCourseStore = defineStore('course', {
    state: (): CourseState => ({
        courses: [],
        managedCourses: [],
        currentCourse: null,
        loading: false,
        error: null,
    }),

    actions: {
        async fetchCourses() {
            this.loading = true;
            this.error = null;
            try {
                this.courses = await coursesApi.getCourses();
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch courses';
                console.error('Error fetching courses:', err);
            } finally {
                this.loading = false;
            }
        },

        async fetchCourseById(id: number | string) {
            this.loading = true;
            this.error = null;
            try {
                this.currentCourse = await coursesApi.getCourseById(id);
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch course detail';
                console.error('Error fetching course detail:', err);
            } finally {
                this.loading = false;
            }
        },

        async fetchManagedCourses() {
            this.loading = true;
            this.error = null;
            try {
                this.managedCourses = await coursesApi.getManagedCourses();
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch managed courses';
                console.error('Error fetching managed courses:', err);
            } finally {
                this.loading = false;
            }
        },

        async createCourse(payload: CreateCoursePayload) {
            this.loading = true;
            this.error = null;
            try {
                const newCourse = await coursesApi.createCourse(payload);
                // Refresh managed courses list after creation
                await this.fetchManagedCourses();
                return newCourse;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to create course';
                console.error('Error creating course:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateCourse(id: number | string, payload: Partial<CreateCoursePayload>) {
            this.loading = true;
            this.error = null;
            try {
                const updatedCourse = await coursesApi.updateCourse(id, payload);
                // Refresh lists after update
                await this.fetchManagedCourses();
                return updatedCourse;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to update course';
                console.error('Error updating course:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteCourse(id: number | string) {
            this.loading = true;
            this.error = null;
            try {
                await coursesApi.deleteCourse(id);
                // Remove from local state
                this.managedCourses = this.managedCourses.filter(c => c.course_id !== Number(id));
                this.courses = this.courses.filter(c => c.course_id !== Number(id));
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to delete course';
                console.error('Error deleting course:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        resetCurrentCourse() {
            this.currentCourse = null;
        },

        clearError() {
            this.error = null;
        }
    },

    getters: {
        getCourseByIdFromList: (state) => (id: number) => {
            return state.courses.find(c => c.course_id === id);
        },
        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error
    }
});
