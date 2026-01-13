<template>
  <div class="lesson-content-editor h-100 d-flex flex-column">
    <div class="editor-header p-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
      <div>
        <h5 class="m-0 fw-bold text-dark">
          <i class="fas fa-book-open me-2 text-emerald-500"></i>
          {{ lessonTitle || 'Lesson Content' }}
        </h5>
        <small class="text-muted">จัดการเนื้อหาภายในบทเรียน</small>
      </div>
      <button class="btn btn-light rounded-circle shadow-sm" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="editor-body flex-grow-1 p-3 overflow-auto bg-slate-50">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <i class="fas fa-circle-notch fa-spin text-emerald-500 fa-2x"></i>
        <p class="mt-2 text-muted">กำลังโหลดเนื้อหา...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="contents.length === 0" class="text-center py-5">
        <div class="empty-icon bg-white rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
          <i class="fas fa-layer-group fa-2x text-emerald-300"></i>
        </div>
        <h6 class="fw-bold text-slate-700">ยังไม่มีเนื้อหา</h6>
        <p class="text-muted small">เลือกประเภทเนื้อหาด้านล่างเพื่อเริ่มสร้างบทเรียน</p>
      </div>

      <!-- Content List -->
      <div v-else class="d-flex flex-column gap-3 pb-5">
        <div v-for="(item, index) in contents" :key="item.content_id" class="content-card card border-0 shadow-sm animate-fade-in">
          <div class="card-header bg-white border-bottom-0 pt-3 px-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="badge rounded-pill" :class="getTypeBadgeClass(item.content_type)">
                <i :class="getTypeIcon(item.content_type)" class="me-1"></i>
                {{ item.content_type }}
              </span>
              <span class="text-muted small">#{{ index + 1 }}</span>
            </div>
            <div class="actions">
              <button class="btn btn-sm btn-link text-muted" @click="handleEdit(item)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-link text-danger" @click="handleDelete(item.content_id)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <div class="card-body pt-2 pb-3 px-3">
            <!-- Text Content -->
            <div v-if="item.content_type === 'Text'" class="content-preview text-slate-700 bg-slate-50 p-3 rounded" style="white-space: pre-wrap;">
              {{ item.content_text }}
            </div>
            
            <!-- Video Content -->
            <div v-else-if="item.content_type === 'Video'" class="content-preview">
              <div v-if="getEmbedUrl(item.content_file_url || '')" class="ratio ratio-16x9 rounded overflow-hidden bg-black">
                <iframe :src="getEmbedUrl(item.content_file_url || '') ?? undefined" allowfullscreen></iframe>
              </div>
              <div v-else class="p-3 bg-red-50 text-red-600 rounded border border-red-100">
                <i class="fas fa-exclamation-circle me-1"></i> Invalid Video URL: {{ item.content_file_url }}
              </div>
            </div>

            <!-- File Content -->
            <div v-else-if="item.content_type === 'File'" class="content-preview p-3 border rounded bg-slate-50 d-flex align-items-center gap-3">
              <i class="fas fa-file-pdf fa-2x text-red-500"></i>
              <div class="flex-grow-1 overflow-hidden">
                <div class="fw-bold text-truncate">{{ getFileName(item.content_file_url || '') }}</div>
                <small class="text-muted text-uppercase">{{ item.file_type || 'FILE' }}</small>
              </div>
               <a :href="item.content_file_url" target="_blank" class="btn btn-sm btn-outline-primary">
                 <i class="fas fa-download"></i>
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Bar -->
    <div class="editor-footer p-3 bg-white border-top shadow-lg">
      <div v-if="!showAddForm" class="d-flex gap-2 justify-content-center">
        <button class="btn btn-outline-emerald fw-bold px-4" @click="startAdd('Text')">
          <i class="fas fa-font me-2"></i> ข้อความ
        </button>
        <button class="btn btn-outline-danger fw-bold px-4" @click="startAdd('Video')">
          <i class="fas fa-play-circle me-2"></i> วิดีโอ
        </button>
        <button class="btn btn-outline-primary fw-bold px-4" @click="startAdd('File')">
          <i class="fas fa-paperclip me-2"></i> ไฟล์แนบ
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div v-else class="add-form animate-slide-up">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold m-0 text-emerald-600">
            <i :class="getTypeIcon(addType)" class="me-2"></i>
            {{ isEditing ? 'แก้ไข' : 'เพิ่ม' }} {{ addType }}
          </h6>
          <button class="btn btn-sm btn-light rounded-circle" @click="cancelAdd">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitContent">
          <!-- Text Input -->
          <div v-if="addType === 'Text'" class="mb-3">
            <label class="form-label small fw-bold text-muted">เนื้อหาข้อความ</label>
            <textarea v-model="formData.content_text" class="form-control" rows="5" placeholder="พิมพ์เนื้อหาที่นี่..." required></textarea>
          </div>

          <!-- Video Input -->
          <div v-if="addType === 'Video'" class="mb-3">
            <label class="form-label small fw-bold text-muted">YouTube / Vimeo URL</label>
            <input v-model="formData.content_file_url" type="url" class="form-control" placeholder="https://www.youtube.com/watch?v=..." required>
            <div v-if="formData.content_file_url" class="mt-2 small text-muted">
              Preview: <a :href="formData.content_file_url" target="_blank">{{ formData.content_file_url }}</a>
            </div>
          </div>

          <!-- File Input (URL for now) -->
          <div v-if="addType === 'File'" class="mb-3">
            <label class="form-label small fw-bold text-muted">File URL</label>
            <input v-model="formData.content_file_url" type="url" class="form-control" placeholder="https://..." required>
            <div class="mt-2">
               <label class="form-label small fw-bold text-muted">ชื่อไฟล์ (Optional)</label>
               <input v-model="formData.content_text" type="text" class="form-control" placeholder="Display Name">
            </div>
          </div>

          <div class="d-grid">
            <button type="submit" class="btn btn-emerald text-white fw-bold" :disabled="submitting">
              <i class="fas fa-save me-2"></i> {{ submitting ? 'กำลังบันทึก...' : 'บันทึกเนื้อหา' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { useLessonsStore } from '../lessons.store';
import type { LessonContent, CreateContentPayload } from '../lessons.api';
import { showDeleteConfirm } from '@/core/utils/swal';

const props = defineProps<{
  lessonId: number;
  lessonTitle?: string;
}>();

const emit = defineEmits(['close']);
const lessonsStore = useLessonsStore();

const contents = computed(() => lessonsStore.lessonContents);
const loading = computed(() => lessonsStore.loading);

// Form State
const showAddForm = ref(false);
const addType = ref<'Text' | 'Video' | 'File'>('Text');
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const submitting = ref(false);
const saveError = ref<string | null>(null);

const formData = reactive<{
    content_text: string;
    content_file_url: string;
}>({
    content_text: '',
    content_file_url: '',
});

// Watch lessonId change to fetch contents
watch(() => props.lessonId, (newId) => {
    if (newId) fetchContents();
}, { immediate: true });

async function fetchContents() {
    await lessonsStore.fetchContents(props.lessonId);
}

// Helpers
function getTypeBadgeClass(type: string) {
    switch (type) {
        case 'Text': return 'bg-emerald-100 text-emerald-700';
        case 'Video': return 'bg-red-100 text-red-700';
        case 'File': return 'bg-blue-100 text-blue-700';
        default: return 'bg-secondary';
    }
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'Text': return 'fas fa-align-left';
        case 'Video': return 'fas fa-video';
        case 'File': return 'fas fa-file-alt';
        default: return 'fas fa-cube';
    }
}

function getFileName(url: string) {
    if (!url) return 'Unknown File';
    try {
        return url.split('/').pop() || url;
    } catch (e) {
        return url;
    }
}

function getEmbedUrl(url: string | undefined): string | null {
    if (!url) return null;
    // Simple YouTube ID extraction
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2] && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null; // or return original if verify allows iframe
}

// Actions
function startAdd(type: 'Text' | 'Video' | 'File') {
    addType.value = type;
    isEditing.value = false;
    formData.content_text = '';
    formData.content_file_url = '';
    showAddForm.value = true;
}

function handleEdit(item: LessonContent) {
    addType.value = item.content_type as any;
    isEditing.value = true;
    editingId.value = item.content_id;
    formData.content_text = item.content_text || '';
    formData.content_file_url = item.content_file_url || '';
    showAddForm.value = true;
}

function cancelAdd() {
    showAddForm.value = false;
    isEditing.value = false;
    editingId.value = null;
}

async function handleDelete(id: number) {
    const result = await showDeleteConfirm('เนื้อหานี้');
    if (result.isConfirmed) {
        await lessonsStore.deleteContent(id);
    }
}

async function submitContent() {
    submitting.value = true;
    try {
        const payload: CreateContentPayload = {
            content_type: addType.value,
            content_text: formData.content_text || undefined,
            content_file_url: formData.content_file_url || undefined,
            file_type: addType.value === 'File' ? 'unknown' : undefined
        };

        if (isEditing.value && editingId.value) {
            await lessonsStore.updateContent(editingId.value, payload);
        } else {
            await lessonsStore.addContent(props.lessonId, payload);
        }
        
        cancelAdd();
    } catch (e: any) {
        saveError.value = e?.message || 'ไม่สามารถบันทึกเนื้อหาได้';
    } finally {
        submitting.value = false;
    }
}
</script>

<style scoped>
.editor-body {
    background-color: #f8fafc;
}
.content-card {
    transition: transform 0.2s;
}
.content-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}
.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.bg-emerald-100 { background-color: #d1fae5 !important; }
.text-emerald-700 { color: #047857 !important; }
.text-emerald-600 { color: #059669 !important; }
.text-emerald-500 { color: #10b981 !important; }
.btn-emerald { background-color: #10b981; border-color: #10b981; }
.btn-emerald:hover { background-color: #059669; border-color: #059669; }
.btn-outline-emerald { color: #10b981; border-color: #10b981; }
.btn-outline-emerald:hover { background-color: #10b981; color: white; }
</style>
