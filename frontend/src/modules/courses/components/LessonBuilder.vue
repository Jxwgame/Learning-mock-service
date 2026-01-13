<template>
  <div class="lesson-builder">
    <div class="section-header">
      <h5 class="fw-bold mb-0">บทเรียน ({{ lessons?.length || 0 }})</h5>
      <button class="btn-action-sm" :disabled="!canEdit" @click="showAddModal = true">
        <i class="fas fa-plus me-1"></i>เพิ่มบทเรียน
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <i class="fas fa-spinner fa-spin"></i> กำลังโหลด...
    </div>

    <!-- Lesson List -->
    <div v-else class="lesson-list">
      <div 
        v-for="(lesson, idx) in lessons" 
        :key="lesson.lesson_id" 
        class="lesson-item"
        :class="{ active: selectedLessonId === lesson.lesson_id }"
        @click="handleSelect(lesson)"
      >
        <div class="lesson-handle">
          <i class="fas fa-grip-vertical"></i>
        </div>
        <div class="lesson-number">{{ idx + 1 }}</div>
        <div class="lesson-info">
          <span class="lesson-title">{{ lesson.lesson_title }}</span>
          <div class="lesson-meta-row">
            <span class="lesson-meta">{{ lesson.lesson_content ? 'มีเนื้อหา' : 'ยังไม่มีเนื้อหา' }}</span>
            <span v-if="getAssignmentCount(lesson.lesson_id) > 0" class="badge bg-primary ms-2">
              <i class="fas fa-tasks me-1"></i>{{ getAssignmentCount(lesson.lesson_id) }} แบบฝึกหัด
            </span>
          </div>
        </div>
        <div class="lesson-actions" v-if="canEdit">
          <button class="btn-icon" @click="handleEdit(lesson)" title="แก้ไขหัวข้อ"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" @click="$emit('manage-content', lesson)" title="จัดการเนื้อหา"><i class="fas fa-file-alt"></i></button>
          <button class="btn-icon" @click="$emit('manage-assignments', lesson)" title="จัดการแบบฝึกหัด"><i class="fas fa-tasks"></i></button>
          <button class="btn-icon danger" @click="handleDelete(lesson.lesson_id)" title="ลบ"><i class="fas fa-trash"></i></button>
        </div>
      </div>

      <div v-if="!lessons || lessons.length === 0" class="empty-state">
        <i class="fas fa-book-open fa-2x text-muted mb-2"></i>
        <p>ยังไม่มีบทเรียน</p>
        <button v-if="canEdit" class="btn-add" @click="showAddModal = true">
          <i class="fas fa-plus me-1"></i>เพิ่มบทเรียนแรก
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h5 class="mb-3">{{ editingLesson ? 'แก้ไขบทเรียน' : 'เพิ่มบทเรียนใหม่' }}</h5>
        <div class="form-group mb-3">
          <label>ชื่อบทเรียน *</label>
          <input v-model="form.lesson_title" type="text" class="form-input" placeholder="เช่น บทที่ 1: บทนำ">
        </div>
        <div class="form-group mb-3">
          <label>เนื้อหาเบื้องต้น</label>
          <textarea v-model="form.lesson_content" class="form-input" rows="3" placeholder="รายละเอียดบทเรียน..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">ยกเลิก</button>
          <button class="btn-save" :disabled="!form.lesson_title.trim()" @click="handleSave">
            {{ editingLesson ? 'บันทึก' : 'เพิ่ม' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { useLessonsStore } from '../lessons.store';
import type { Lesson } from '../lessons.api';
import type { Assignment } from '../../assignments/assignments.api';
import { showDeleteConfirm } from '@/core/utils/swal';

const props = defineProps<{
  courseId: number | string;
  versionId: number | string | null;
  canEdit?: boolean;
  selectedLessonId?: number | null;
  assignments?: Assignment[];
}>();

const emit = defineEmits(['manage-content', 'manage-assignments', 'select-lesson']);

const store = useLessonsStore();
const lessons = computed(() => (store.lessons || []).filter(l => !!l));
const loading = computed(() => store.loading);

const showAddModal = ref(false);
const editingLesson = ref<Lesson | null>(null);
const form = reactive({ lesson_title: '', lesson_content: '' });

watch(() => props.versionId, (val) => {
  if (val) store.fetchLessons(props.courseId, val);
}, { immediate: true });

const handleSelect = (lesson: Lesson) => {
    emit('select-lesson', lesson);
};

const getAssignmentCount = (lessonId: number): number => {
    if (!props.assignments || !Array.isArray(props.assignments)) return 0;
    return props.assignments.filter(a => a && a.lesson_id === lessonId).length;
};

const handleEdit = (lesson: Lesson) => {
  editingLesson.value = lesson;
  form.lesson_title = lesson.lesson_title;
  form.lesson_content = lesson.lesson_content || '';
  showAddModal.value = true;
};

// ... (resume formatted code) ...

const closeModal = () => {
  showAddModal.value = false;
  editingLesson.value = null;
  form.lesson_title = '';
  form.lesson_content = '';
};

const handleSave = async () => {
  if (!props.versionId) return;
  if (editingLesson.value) {
    await store.updateLesson(editingLesson.value.lesson_id, form);
  } else {
    await store.createLesson(props.courseId, props.versionId, form);
  }
  closeModal();
};

const handleDelete = async (lessonId: number) => {
  const result = await showDeleteConfirm('บทเรียนนี้');
  if (result.isConfirmed) {
    await store.deleteLesson(lessonId);
  }
};
</script>

<style scoped>
.lesson-builder { background: white; border-radius: 16px; padding: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.btn-action-sm { background: #eff6ff; color: #3b82f6; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-action-sm:disabled { opacity: 0.5; cursor: not-allowed; }
.lesson-list { display: flex; flex-direction: column; gap: 8px; }
.lesson-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #f8fafc; border-radius: 12px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
.lesson-item:hover { background: #f1f5f9; }
.lesson-item.active { border-color: #3b82f6; background: #eff6ff; }
.lesson-handle { color: #cbd5e1; cursor: grab; }
.lesson-number { width: 28px; height: 28px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #64748b; }
.lesson-item.active .lesson-number { background: #3b82f6; color: white; }
.lesson-info { flex: 1; }
.lesson-title { font-weight: 600; color: #1e293b; display: block; }
.lesson-meta { font-size: 0.8rem; color: #94a3b8; }
.lesson-actions { display: flex; gap: 6px; }
.btn-icon { width: 32px; height: 32px; border: none; background: #e2e8f0; border-radius: 8px; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-icon:hover { background: #cbd5e1; }
.btn-icon.danger:hover { background: #fee2e2; color: #ef4444; }
.empty-state { text-align: center; padding: 40px; color: #94a3b8; }
.btn-add { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; margin-top: 12px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 500px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; color: #475569; }
.form-input { width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; }
.form-input:focus { outline: none; border-color: #3b82f6; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; background: #f1f5f9; border: none; border-radius: 10px; font-weight: 600; color: #64748b; cursor: pointer; }
.btn-save { padding: 10px 24px; background: #3b82f6; border: none; border-radius: 10px; font-weight: 600; color: white; cursor: pointer; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
