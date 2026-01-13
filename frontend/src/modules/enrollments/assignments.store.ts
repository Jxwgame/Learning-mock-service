import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { assignmentsApi, type Assignment, type AssignmentSubmission, type CreateSubmissionPayload } from './assignments.api';

export const useAssignmentsStore = defineStore('assignments', () => {
    // State
    const assignments = ref<Assignment[]>([]);
    const submissions = ref<Map<number, AssignmentSubmission[]>>(new Map()); // assignmentId -> submissions[]
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Getters
    const getAssignmentsByLesson = computed(() => (lessonId: number) => {
        return assignments.value.filter(a => a.lesson_id === lessonId);
    });

    const getMySubmission = computed(() => (assignmentId: number) => {
        const subs = submissions.value.get(assignmentId);
        return subs && subs.length > 0 ? subs[0] : null; // Return latest or first? Usually latest.
    });

    // Actions
    async function fetchAssignments(courseId: number) {
        loading.value = true;
        error.value = null;
        try {
            const data = await assignmentsApi.listPublishedAssignments(courseId);
            assignments.value = data;
        } catch (e: any) {
            error.value = e.message || "Failed to load assignments";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function fetchMySubmissions(assignmentId: number) {
        // Can be called individually if needed
        const subs = await assignmentsApi.getMySubmissions(assignmentId);
        submissions.value.set(assignmentId, subs);
        return subs;
    }

    async function submit(assignmentId: number, payload: CreateSubmissionPayload) {
        loading.value = true;
        error.value = null;
        try {
            const result = await assignmentsApi.createSubmission(assignmentId, payload);
            // Update local state
            const currentSubs = submissions.value.get(assignmentId) || [];
            submissions.value.set(assignmentId, [result, ...currentSubs]);
            return result;
        } catch (e: any) {
            error.value = e.message || "Failed to submit assignment";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    function $reset() {
        assignments.value = [];
        submissions.value.clear();
        loading.value = false;
        error.value = null;
    }

    return {
        assignments,
        submissions,
        loading,
        error,
        getAssignmentsByLesson,
        getMySubmission,
        fetchAssignments,
        fetchMySubmissions,
        submit,
        $reset
    };
});
