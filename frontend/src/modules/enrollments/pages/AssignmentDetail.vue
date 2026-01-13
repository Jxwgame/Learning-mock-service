<template>
  <div class="assignment-detail-page">
    <div class="content-wrapper">
      <router-link :to="`/learning/${courseId}`" class="back-text">
        <i class="fas fa-arrow-left me-2"></i> กลับไปหน้าบทเรียน
      </router-link>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">กำลังโหลดข้อมูลแบบฝึกหัด...</p>
      </div>

      <div v-else-if="error" class="text-center py-5">
        <div class="text-danger mb-3"><i class="fas fa-exclamation-circle fa-2x"></i></div>
        <h3>เกิดข้อผิดพลาด</h3>
        <p class="text-muted">{{ error }}</p>
        <button class="btn btn-outline-primary" @click="fetchData">ลองใหม่</button>
      </div>

      <div v-else-if="assignment" class="row g-4 animate-fade-in">
        <!-- Left Column: Instructions -->
        <div class="col-lg-8">
          <div class="card instruction-card h-100">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <h1 class="card-title fw-bold text-dark mb-0 lh-base">{{ assignment.title }}</h1>
                <span class="badge bg-warning text-dark fs-6 rounded-pill px-3 py-2 flex-shrink-0 ms-3 shadow-sm">
                  {{ assignment.max_score }} คะแนน
                </span>
              </div>
              
              <div class="meta-info mb-4 text-muted d-flex align-items-center gap-3">
                <span v-if="assignment.due_date">
                    <i class="fas fa-calendar-alt me-2 text-primary"></i> 
                    กำหนดส่ง: {{ new Date(assignment.due_date).toLocaleString('th-TH') }}
                </span>
                <span v-else>
                    <i class="fas fa-clock me-2 text-primary"></i> ไม่มีกำหนดส่ง
                </span>
              </div>

              <hr class="mb-4 opacity-10">

              <h5 class="fw-bold mb-3 text-secondary"><i class="fas fa-book-open me-2 text-success"></i> คำชี้แจง</h5>
              <div class="assignment-description text-dark" style="white-space: pre-wrap; line-height: 1.8; font-size: 1.05rem;">
                {{ assignment.description || 'ไม่มีคำอธิบายเพิ่มเติม' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Submission -->
        <div class="col-lg-4">
          <div class="card submission-card border-0 shadow-sm sticky-top" style="top: 100px; z-index: 10;">
            <div class="card-header bg-white py-3 fw-bold border-bottom px-4">
              <i class="fas fa-paper-plane me-2 text-primary"></i> การส่งงานของคุณ
            </div>
            <div class="card-body p-4">
              
              <!-- Already Submitted -->
              <div v-if="submission" class="submitted-state">
                <div class="text-center mb-4 pt-3">
                   <div class="submission-status mb-2" :class="submission.status === 'graded' ? 'text-success' : 'text-primary'">
                      <div class="status-icon-wrapper mb-3 mx-auto">
                        <i class="fas fa-check fa-2x"></i>
                      </div>
                      <h5 class="fw-bold">{{ submission.status === 'graded' ? 'ตรวจแล้ว' : 'ส่งแล้ว' }}</h5>
                   </div>
                   <div class="text-muted small">
                      ส่งเมื่อ: {{ new Date(submission.submitted_at).toLocaleString('th-TH') }}
                   </div>
                </div>

                <div class="bg-light p-3 rounded-3 mb-3 border">
                   <div class="fw-bold small text-muted mb-2 text-uppercase">เนื้อหาที่ส่ง:</div>
                   <p class="mb-3 text-dark" v-if="submission.content">{{ submission.content }}</p>
                   <a v-if="submission.file_url" :href="submission.file_url" target="_blank" class="file-link d-flex align-items-center gap-2 text-decoration-none border p-2 rounded bg-white mt-1">
                      <div class="file-icon bg-light rounded p-2"><i class="fas fa-link text-primary"></i></div>
                      <span class="text-truncate text-dark fw-medium" style="max-width: 150px;">{{ submission.file_url }}</span>
                      <i class="fas fa-external-link-alt small ms-auto text-muted"></i>
                   </a>
                </div>

                <div v-if="submission.status === 'graded'" class="alert alert-success border-0 shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="text-success"><i class="fas fa-award me-1"></i> ผลการตรวจ</strong>
                        <span class="badge bg-success fs-6 rounded-pill">{{ submission.grade }} / {{ assignment.max_score }}</span>
                    </div>
                    <div v-if="submission.feedback" class="small mt-2 pt-2 border-top border-success-subtle text-success-emphasis">
                        <i class="fas fa-comment-dots me-1"></i> {{ submission.feedback }}
                    </div>
                </div>
              </div>

              <!-- Submission Form -->
              <div v-else>
                 <form @submit.prevent="handleSubmit">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-muted">คำตอบ / รายละเอียด</label>
                      <textarea v-model="form.content" class="form-control bg-light border-0" rows="5" placeholder="พิมพ์คำตอบที่นี่..." style="resize: none;"></textarea>
                    </div>
                    
                    <div class="mb-4">
                       <label class="form-label small fw-bold text-muted">แนบลิงก์ผลงาน (URL)</label>
                       <div class="input-group">
                           <span class="input-group-text bg-light border-0"><i class="fas fa-link text-muted"></i></span>
                           <input v-model="form.file_url" type="url" class="form-control bg-light border-0" placeholder="https://...">
                       </div>
                    </div>

                    <div class="d-grid">
                      <button type="submit" class="btn btn-primary py-3 fw-bold rounded-3 shadow-sm btn-submit" :disabled="submitting || (!form.content && !form.file_url)">
                          <span v-if="submitting"><i class="fas fa-spinner fa-spin me-2"></i> กำลังส่ง...</span>
                          <span v-else><i class="fas fa-paper-plane me-2"></i> ส่งงาน</span>
                      </button>
                    </div>
                 </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAssignmentsStore } from '../assignments.store';
import type { Assignment, AssignmentSubmission } from '../assignments.api';

const route = useRoute();
const assignmentsStore = useAssignmentsStore();

const courseId = computed(() => Number(route.params.courseId));
const assignmentId = computed(() => Number(route.params.assignmentId));

const assignment = ref<Assignment | null>(null);
const submission = ref<AssignmentSubmission | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const submitting = ref(false);

const form = reactive({
    content: '',
    file_url: ''
});

async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
        if (assignmentsStore.assignments.length === 0) {
            await assignmentsStore.fetchAssignments(courseId.value);
        }
        
        const found = assignmentsStore.assignments.find(a => a.assignment_id === assignmentId.value);
        if (!found) throw new Error('Assignment not found');
        assignment.value = found;

        submission.value = await assignmentsStore.fetchMySubmissions(assignmentId.value).then(subs => subs[0] || null);

    } catch (e: any) {
        error.value = e.message || 'Error loading assignment';
    } finally {
        loading.value = false;
    }
}

async function handleSubmit() {
    if (!form.content && !form.file_url) return;
    
    submitting.value = true;
    try {
        const result = await assignmentsStore.submit(assignmentId.value, {
            content: form.content,
            file_url: form.file_url
        });
        submission.value = result;
        form.content = '';
        form.file_url = '';
        // Could show toast success here
    } catch (e: any) {
        alert(e.message || 'ส่งงานไม่สำเร็จ');
    } finally {
        submitting.value = false;
    }
}

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.assignment-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
}

.content-wrapper { max-width: 1100px; margin: 0 auto; padding: 100px 20px 20px; }

.back-text {
  text-decoration: none;
  font-weight: 600;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  margin-bottom: 30px;
  transition: color 0.2s;
}
.back-text:hover { color: #0f172a; }

.instruction-card {
    border: 1px solid #f1f3f5;
    border-radius: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.03);
    border-left: 6px solid #1976d2;
}

.submission-card {
    border-radius: 20px;
    overflow: hidden;
}

.status-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #e7f1ff;
    color: #0d6efd;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-success .status-icon-wrapper { background: #d1e7dd; color: #198754; }

.file-link:hover {
    background-color: #f8f9fa !important;
    border-color: #dee2e6 !important;
}

.btn-submit {
    transition: transform 0.2s, box-shadow 0.2s;
}
.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25) !important;
}

.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.form-control:focus {
    background-color: white;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}
</style>