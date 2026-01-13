<template>
  <Teleport to="body">
    <div class="assignment-editor">
      <div class="modal fade" id="assignmentEditorModal" tabindex="-1" aria-hidden="true" ref="modalRef">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEdit ? 'แก้ไขแบบฝึกหัด' : 'สร้างแบบฝึกหัดใหม่' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="title" class="form-label">หัวข้อ <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    v-model="form.title"
                    required
                    placeholder="เช่น มิดเทอมสอบปฏิบัติ"
                  />
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">คำอธิบาย</label>
                  <textarea
                    class="form-control"
                    id="description"
                    rows="3"
                    v-model="form.description"
                    placeholder="รายละเอียดของงาน..."
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="score" class="form-label">คะแนนเต็ม</label>
                    <input
                      type="number"
                      class="form-control"
                      id="score"
                      v-model.number="form.max_score"
                      min="0"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="dueDate" class="form-label">กำหนดส่ง</label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      id="dueDate"
                      v-model="form.due_date"
                      />
                  </div>
                </div>

                <div v-if="error" class="alert alert-danger mt-3">
                  {{ error }}
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
              <button
                type="button"
                class="btn btn-primary"
                :disabled="loading"
                @click="handleSubmit"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างแบบฝึกหัด' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
// @ts-ignore
import { Modal } from 'bootstrap';
import type { Assignment, CreateAssignmentDto, UpdateAssignmentDto } from '../assignments.api';
import { useAssignmentsStore } from '../assignments.store';

// No props needed for imperative open() usage, but keeping for compatibility if needed
const props = defineProps<{
  initialData?: Assignment | null;
}>();

const emit = defineEmits(['saved', 'close']);

const assignmentsStore = useAssignmentsStore();
const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const loading = ref(false);
const error = ref<string | null>(null);

// State for editing
const currentLessonId = ref<number | null>(null);
const currentAssignmentId = ref<number | null>(null);
const isEdit = computed(() => !!currentAssignmentId.value);

const form = reactive({
  title: '',
  description: '',
  max_score: 10 as number | null,
  due_date: '',
});

onMounted(() => {
  console.log("AssignmentEditor Mounted. Ref:", modalRef.value);
  if (modalRef.value) {
    try {
        modalInstance = new Modal(modalRef.value);
        console.log("Modal initialized successfully");
        modalRef.value.addEventListener('hidden.bs.modal', () => {
          emit('close');
          resetForm();
        });
    } catch (e) {
        console.error("Failed to init Modal:", e);
    }
  } else {
      console.error("Modal ref not found in DOM");
  }
});


function resetForm() {
    form.title = '';
    form.description = '';
    form.max_score = 10;
    form.due_date = '';
    currentAssignmentId.value = null;
    currentLessonId.value = null;
    error.value = null;
}

// Imperative API
function open(lessonId: number, assignment?: Assignment) {
  console.log("AssignmentEditor.open called", { lessonId, assignment });
  resetForm();
  currentLessonId.value = lessonId;
  
  if (assignment) {
      currentAssignmentId.value = assignment.assignment_id;
      form.title = assignment.title;
      form.description = assignment.description || '';
      form.max_score = assignment.max_score;
      form.due_date = assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '';
  }
  
  if (modalInstance) {
      console.log("Showing modal instance");
      modalInstance.show();
  } else {
      console.error("Cannot open: modalInstance is null");
      // Try to re-init
      if (modalRef.value) {
           modalInstance = new Modal(modalRef.value);
           modalInstance.show();
      }
  }
}

function hide() {
  modalInstance?.hide();
}

async function handleSubmit() {
  if (!form.title.trim()) {
    error.value = 'กรุณาระบุหัวข้อแบบฝึกหัด';
    return;
  }
  
  if (!currentLessonId.value) {
      error.value = 'ไม่พบข้อมูลบทเรียน (Lesson ID missing)';
      return;
  }

  loading.value = true;
  error.value = null;

  try {
    if (isEdit.value && currentAssignmentId.value) {
        // Update
        const payload: UpdateAssignmentDto = {
            title: form.title,
            description: form.description,
            max_score: form.max_score,
            due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        };
        await assignmentsStore.updateAssignment(currentAssignmentId.value, payload);
    } else {
        // Create
        const payload: CreateAssignmentDto = {
            title: form.title,
            description: form.description,
            max_score: form.max_score,
            due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        };
        await assignmentsStore.createAssignment(currentLessonId.value, payload);
    }
    
    emit('saved'); // Emit signal that save is complete
    hide();
  } catch (e: any) {
    console.error(e);
    error.value = e.message || 'เกิดข้อผิดพลาดในการบันทึก';
  } finally {
    loading.value = false;
  }
}

defineExpose({ open, hide });
</script>
