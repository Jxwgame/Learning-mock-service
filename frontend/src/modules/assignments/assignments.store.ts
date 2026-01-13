import { defineStore } from 'pinia';
import { assignmentsApi, type Assignment, type AssignmentSubmission, type CreateAssignmentDto, type UpdateAssignmentDto } from './assignments.api';

export const useAssignmentsStore = defineStore('assignments', {
    state: () => ({
        assignments: [] as Assignment[],
        submissions: [] as AssignmentSubmission[],
        mySubmissions: [] as AssignmentSubmission[],
        loading: false,
        error: null as string | null,
    }),

    getters: {
        getAssignmentsByLesson: (state) => (lessonId: number) => {
            return state.assignments.filter(a => a.lesson_id === lessonId);
        }
    },

    actions: {
        async fetchAssignments(courseId: number) {
            await this.fetchPublishedAssignments(courseId);
        },

        async fetchPublishedAssignments(courseId: number) {
            this.loading = true;
            this.error = null;
            try {
                const data = await assignmentsApi.listPublishedAssignments(courseId);
                // Only update state if we are viewing a specific course? 
                // For now, let's just set it. 
                // But for the dashboard we need the return value.
                this.assignments = data;
                return data; // Return data for component usage
            } catch (e: any) {
                this.error = e.message || 'Failed to fetch assignments';
                return [];
            } finally {
                this.loading = false;
            }
        },

        async createAssignment(lessonId: number, payload: CreateAssignmentDto) {
            this.loading = true;
            try {
                const newAssignment = await assignmentsApi.createAssignment(lessonId, payload);
                this.assignments.push(newAssignment);
                return newAssignment;
            } catch (e: any) {
                this.error = e.message || 'Failed to create assignment';
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async updateAssignment(assignmentId: number, payload: UpdateAssignmentDto) {
            this.loading = true;
            try {
                const updated = await assignmentsApi.updateAssignment(assignmentId, payload);
                const idx = this.assignments.findIndex(a => a.assignment_id === assignmentId);
                if (idx !== -1) this.assignments[idx] = updated;
                return updated;
            } catch (e: any) {
                this.error = e.message || 'Failed to update assignment';
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async deleteAssignment(assignmentId: number) {
            this.loading = true;
            try {
                await assignmentsApi.deleteAssignment(assignmentId);
                this.assignments = this.assignments.filter(a => a.assignment_id !== assignmentId);
            } catch (e: any) {
                this.error = e.message || 'Failed to delete assignment';
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async fetchSubmissions(assignmentId: number) {
            this.loading = true;
            try {
                this.submissions = await assignmentsApi.listSubmissionsForAssignment(assignmentId);
            } catch (e: any) {
                this.error = e.message || 'Failed to fetch submissions';
            } finally {
                this.loading = false;
            }
        },

        async fetchMySubmissions(assignmentId: number) {
            this.loading = true;
            try {
                this.mySubmissions = await assignmentsApi.listMySubmissions(assignmentId);
                return this.mySubmissions;
            } catch (e: any) {
                this.error = e.message || 'Failed to fetch my submissions';
                return [];
            } finally {
                this.loading = false;
            }
        }
    }
});
