<template>
  <div class="version-manager">
    <div class="section-header">
      <h5 class="fw-bold mb-0">เวอร์ชัน Draft (คอร์สนี้)</h5>
      <button class="btn-action-sm" :disabled="loading || hasDraft" @click="handleCreateDraft">
        <i class="fas fa-plus me-1"></i>สร้าง Draft
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <i class="fas fa-spinner fa-spin"></i> กำลังโหลด...
    </div>

    <!-- Version List -->
    <div v-else class="version-list">
      <div v-for="v in versions" :key="v.version_id" class="version-card" :class="v.status.toLowerCase()">
        <div class="version-info">
          <span class="version-number">v{{ v.version_number }}</span>
          <span class="version-status" :class="v.status.toLowerCase()">{{ statusText(v.status) }}</span>
        </div>
        <div class="version-actions">
          <template v-if="v.status === 'Draft'">
            <button class="btn-mini primary" @click="$emit('edit-draft', v)">
              <i class="fas fa-edit"></i> แก้ไข
            </button>
            <button class="btn-mini success" @click="handlePublish(v.version_id)">
              <i class="fas fa-rocket"></i> Publish
            </button>
          </template>
          <template v-else-if="v.status === 'Published'">
            <button class="btn-mini warning" @click="handleRollback(v.version_id)" :disabled="isActive(v)">
              <i class="fas fa-undo"></i> Rollback
            </button>
            <button class="btn-mini danger" @click="handleArchive(v.version_id)" :disabled="isActive(v)">
              <i class="fas fa-archive"></i>
            </button>
          </template>
          <span v-if="isActive(v)" class="badge-active">Active</span>
        </div>
      </div>

      <div v-if="versions.length === 0" class="empty-state">
        <i class="fas fa-layer-group fa-2x text-muted mb-2"></i>
        <p>ยังไม่มีเวอร์ชัน</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCourseVersionsStore } from '../courseVersions.store';
import { showConfirm } from '@/core/utils/swal';

const props = defineProps<{
  courseId: number | string;
  activeVersionId?: number | null;
}>();

const emit = defineEmits(['edit-draft', 'version-changed']);

const store = useCourseVersionsStore();
const versions = computed(() => store.versions);
const loading = computed(() => store.loading);
const hasDraft = computed(() => versions.value.some(v => v.status === 'Draft'));

onMounted(() => {
  store.fetchVersions(props.courseId);
});

const statusText = (status: string) => {
  const map: Record<string, string> = { Draft: 'ฉบับร่าง', Published: 'เผยแพร่', Archived: 'เก็บถาวร' };
  return map[status] || status;
};

const isActive = (v: any) => v.version_id === props.activeVersionId;

const handleCreateDraft = async () => {
  await store.createDraft(props.courseId);
  emit('version-changed');
};

const handlePublish = async (versionId: number) => {
  const result = await showConfirm('ยืนยันเผยแพร่เวอร์ชันนี้?');
  if (result.isConfirmed) {
    await store.publish(props.courseId, versionId);
    emit('version-changed');
  }
};

const handleRollback = async (versionId: number) => {
  const result = await showConfirm('ยืนยัน Rollback ไปเวอร์ชันนี้?');
  if (result.isConfirmed) {
    await store.rollback(props.courseId, versionId);
    emit('version-changed');
  }
};

const handleArchive = async (versionId: number) => {
  const result = await showConfirm('ยืนยัน Archive เวอร์ชันนี้?');
  if (result.isConfirmed) {
    await store.archive(props.courseId, versionId);
  }
};
</script>

<style scoped>
.version-manager { background: white; border-radius: 16px; padding: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.btn-action-sm { background: #f0fdf4; color: #10b981; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-action-sm:disabled { opacity: 0.5; cursor: not-allowed; }
.version-list { display: flex; flex-direction: column; gap: 10px; }
.version-card { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #e2e8f0; }
.version-card.draft { border-left-color: #f59e0b; }
.version-card.published { border-left-color: #10b981; }
.version-card.archived { border-left-color: #94a3b8; opacity: 0.7; }
.version-info { display: flex; align-items: center; gap: 12px; }
.version-number { font-weight: 700; color: #1e293b; }
.version-status { font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
.version-status.draft { background: #fef3c7; color: #d97706; }
.version-status.published { background: #dcfce7; color: #16a34a; }
.version-status.archived { background: #f1f5f9; color: #64748b; }
.version-actions { display: flex; gap: 8px; align-items: center; }
.btn-mini { padding: 6px 12px; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-mini.primary { background: #eff6ff; color: #3b82f6; }
.btn-mini.success { background: #dcfce7; color: #16a34a; }
.btn-mini.warning { background: #fef3c7; color: #d97706; }
.btn-mini.danger { background: #fee2e2; color: #ef4444; }
.btn-mini:disabled { opacity: 0.5; cursor: not-allowed; }
.badge-active { background: #10b981; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
.empty-state { text-align: center; padding: 30px; color: #94a3b8; }
</style>
