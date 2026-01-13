import { defineStore } from 'pinia';
import { ref } from 'vue';
import { courseVersionsApi, type CourseVersion } from './courseVersions.api';

export const useCourseVersionsStore = defineStore('courseVersions', () => {
    const versions = ref<CourseVersion[]>([]);
    const currentVersion = ref<CourseVersion | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchVersions(courseId: number | string) {
        loading.value = true;
        error.value = null;
        try {
            versions.value = await courseVersionsApi.listVersions(courseId);
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch versions';
        } finally {
            loading.value = false;
        }
    }

    async function createDraft(courseId: number | string) {
        loading.value = true;
        try {
            const draft = await courseVersionsApi.createDraft(courseId);
            versions.value.unshift(draft);
            return draft;
        } finally {
            loading.value = false;
        }
    }

    async function publish(courseId: number | string, versionId: number | string) {
        const result = await courseVersionsApi.publishVersion(courseId, versionId);
        const idx = versions.value.findIndex(v => v.version_id === Number(versionId));
        if (idx !== -1) versions.value[idx] = result;
        return result;
    }

    async function rollback(courseId: number | string, versionId: number | string) {
        return courseVersionsApi.rollbackVersion(courseId, versionId);
    }

    async function archive(courseId: number | string, versionId: number | string) {
        const result = await courseVersionsApi.archiveVersion(courseId, versionId);
        const idx = versions.value.findIndex(v => v.version_id === Number(versionId));
        if (idx !== -1) versions.value[idx] = result;
        return result;
    }

    const draftVersion = () => versions.value.find(v => v.status === 'Draft');
    const publishedVersions = () => versions.value.filter(v => v.status === 'Published');

    return {
        versions,
        currentVersion,
        loading,
        error,
        fetchVersions,
        createDraft,
        publish,
        rollback,
        archive,
        draftVersion,
        publishedVersions,
    };
});
