<template>
  <div class="grading-detail-page">
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Back Button -->
      <router-link to="/grading" class="back-link">
        <i class="bi bi-arrow-left me-2"></i>กลับไปรายการงาน
      </router-link>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-3 text-muted">กำลังโหลด...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-5">
        <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem;"></i>
        <h4 class="mt-3">เกิดข้อผิดพลาด</h4>
        <p class="text-muted">{{ error }}</p>
        <button class="btn btn-outline-primary" @click="fetchData">ลองใหม่</button>
      </div>

      <!-- No Submissions -->
      <div v-else-if="noSubmissions" class="empty-state-container">
        <div class="empty-state-card">
          <div class="empty-icon">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>ยังไม่มีงานส่งเข้ามา</h3>
          <p class="text-muted">แบบฝึกหัดนี้ยังไม่มีผู้เรียนส่งงานเข้ามา</p>
          
          <!-- Assignment Info -->
          <div v-if="assignment" class="assignment-info mt-4">
            <h5>{{ assignment.title }}</h5>
            <p class="mb-0">คะแนนเต็ม: {{ assignment.max_score }}</p>
            <p v-if="assignment.due_date" class="mb-0">กำหนดส่ง: {{ formatDate(assignment.due_date) }}</p>
          </div>
          
          <router-link to="/grading" class="btn btn-primary mt-4">
            <i class="bi bi-arrow-left me-2"></i>กลับไปหน้ารายการงาน
          </router-link>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="grading-content">
        <div class="row">
          <!-- Left: Submission Content -->
          <div class="col-lg-8">
            <!-- Assignment Info -->
            <div class="info-card mb-4">
              <h2 class="assignment-title">{{ assignment?.title }}</h2>
              <div class="meta-row">
                <span><i class="bi bi-journal-bookmark me-1"></i>{{ assignment?.course_name || 'Course' }}</span>
                <span><i class="bi bi-star me-1"></i>{{ assignment?.max_score }} คะแนน</span>
                <span v-if="assignment?.due_date">
                  <i class="bi bi-calendar me-1"></i>กำหนดส่ง: {{ formatDate(assignment.due_date) }}
                </span>
              </div>
              <p v-if="assignment?.description" class="description mt-3">
                {{ assignment.description }}
              </p>
            </div>

            <!-- Student Info -->
            <div class="info-card mb-4">
              <div class="student-header">
                <div class="student-avatar">
                  {{ getInitials(submission?.user_first_name, submission?.user_last_name) }}
                </div>
                <div class="student-info">
                  <h4>{{ submission?.user_first_name || '' }} {{ submission?.user_last_name || '' }}</h4>
                  <span class="text-muted">{{ submission?.user_email }}</span>
                </div>
                <span v-if="isLate" class="late-badge">
                  <i class="bi bi-exclamation-triangle me-1"></i>ส่งสาย
                </span>
              </div>
              <div class="submission-time mt-3">
                <i class="bi bi-clock me-2"></i>
                ส่งเมื่อ: {{ submission ? formatDateTime(submission.submission_date) : '-' }}
              </div>
            </div>

            <!-- Submitted Content -->
            <div class="content-card">
              <h5 class="card-title"><i class="bi bi-file-text me-2"></i>เนื้อหาที่ส่ง</h5>
              
              <!-- Text Content -->
              <div v-if="submission?.content" class="content-text">
                {{ submission.content }}
              </div>
              
              <!-- File URL -->
              <div v-if="submission?.file_url" class="file-attachment">
                <div class="file-icon">
                  <i class="bi bi-file-earmark-arrow-down"></i>
                </div>
                <div class="file-info">
                  <span class="file-name">{{ getFileName(submission.file_url) }}</span>
                  <a :href="submission.file_url" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-download me-1"></i>ดาวน์โหลด/เปิด
                  </a>
                </div>
              </div>
              
              <!-- No Content -->
              <div v-if="!submission?.content && !submission?.file_url" class="no-content">
                <i class="bi bi-inbox"></i>
                <p>ไม่มีเนื้อหาที่ส่ง</p>
              </div>
            </div>
          </div>

          <!-- Right: Grading Panel -->
          <div class="col-lg-4">
            <div class="grading-panel">
              <h5 class="panel-title"><i class="bi bi-pencil-square me-2"></i>ให้คะแนน</h5>
              
              <!-- Current Status -->
              <div v-if="submission?.status === 'graded'" class="current-grade mb-4">
                <div class="grade-badge">
                  <span class="grade-value">{{ submission.grade }}</span>
                  <span class="grade-max">/ {{ assignment?.max_score || 10 }}</span>
                </div>
                <div class="graded-info">
                  <i class="bi bi-check-circle-fill text-success me-1"></i>
                  ตรวจแล้ว
                </div>
              </div>
              
              <!-- Grade Input -->
              <div class="mb-4">
                <label class="form-label fw-bold">คะแนน</label>
                <div class="grade-input-group">
                  <input 
                    type="number" 
                    v-model.number="gradeForm.grade"
                    class="form-control grade-input"
                    :min="0"
                    :max="assignment?.max_score || 10"
                    step="0.5"
                  />
                  <span class="grade-max-label">/ {{ assignment?.max_score || 10 }}</span>
                </div>
              </div>
              
              <!-- Feedback -->
              <div class="mb-4">
                <label class="form-label fw-bold">คำติชม / Feedback</label>
                <textarea 
                  v-model="gradeForm.feedback"
                  class="form-control feedback-input"
                  rows="5"
                  placeholder="เขียนคำติชมให้นักเรียน..."
                ></textarea>
              </div>
              
              <!-- Quick Feedback -->
              <div class="quick-feedback mb-4">
                <label class="form-label small text-muted">เลือก Feedback ด่วน:</label>
                <div class="quick-btns">
                  <button class="quick-btn" @click="addQuickFeedback('ทำได้ดีมาก!')">👍 ดีมาก</button>
                  <button class="quick-btn" @click="addQuickFeedback('ควรปรับปรุงเพิ่มเติม')">📝 ปรับปรุง</button>
                  <button class="quick-btn" @click="addQuickFeedback('กรุณาทำใหม่และส่งอีกครั้ง')">🔄 ทำใหม่</button>
                </div>
              </div>
              
              <!-- Submit Button -->
              <button 
                class="btn btn-save w-100"
                :disabled="saving || gradeForm.grade === null"
                @click="handleSaveGrade"
              >
                <span v-if="saving">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  กำลังบันทึก...
                </span>
                <span v-else>
                  <i class="bi bi-check-circle me-2"></i>
                  บันทึกคะแนน
                </span>
              </button>
              
              <!-- Success Message -->
              <div v-if="saveSuccess" class="alert alert-success mt-3 mb-0">
                <i class="bi bi-check-circle me-2"></i>
                บันทึกคะแนนเรียบร้อยแล้ว!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccess, showError, showConfirm } from '@/core/utils/swal';
import * as gradingApi from './grading.api';
import type { Assignment, Submission } from './grading.api';

const route = useRoute();
const router = useRouter();

// Route params
const assignmentId = computed(() => Number(route.params.assignmentId));
const submissionId = computed(() => Number(route.params.submissionId));

// Data
const loading = ref(true);
const error = ref<string | null>(null);
const noSubmissions = ref(false);
const saving = ref(false);
const saveSuccess = ref(false);

const assignment = ref<Assignment | null>(null);
const submission = ref<Submission | null>(null);

const gradeForm = reactive({
  grade: null as number | null,
  feedback: ''
});

// Computed
const isLate = computed(() => {
  if (!submission.value || !assignment.value?.due_date) return false;
  return new Date(submission.value.submission_date) > new Date(assignment.value.due_date);
});

// Helpers
function getInitials(first?: string, last?: string): string {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || 'U';
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getFileName(url: string): string {
  try {
    return url.split('/').pop() || url;
  } catch {
    return url;
  }
}

function addQuickFeedback(text: string) {
  if (gradeForm.feedback) {
    gradeForm.feedback += '\n' + text;
  } else {
    gradeForm.feedback = text;
  }
}

// API calls
async function fetchData() {
  loading.value = true;
  error.value = null;
  noSubmissions.value = false;
  
  try {
    // Get assignment info
    assignment.value = await gradingApi.getAssignment(assignmentId.value);
    
    // Get all submissions
    const submissions = await gradingApi.listSubmissions(assignmentId.value);
    
    if (submissions.length === 0) {
      noSubmissions.value = true;
      loading.value = false;
      return;
    }
    
    // Find specific submission
    const found = submissions.find(s => s.submission_id === submissionId.value);
    
    if (!found) {
      noSubmissions.value = true;
      loading.value = false;
      return;
    }
    
    submission.value = found;
    
    // Pre-fill form if already graded
    if (found.status === 'graded') {
      gradeForm.grade = found.grade ?? null;
      gradeForm.feedback = found.feedback || '';
    }
    
  } catch (e: any) {
    console.error(e);
    error.value = e.message || 'ไม่สามารถโหลดข้อมูลได้';
  } finally {
    loading.value = false;
  }
}

async function handleSaveGrade() {
  if (gradeForm.grade === null) return;
  
  const confirm = await showConfirm('ยืนยันการบันทึกคะแนน?', 'คุณต้องการบันทึกผลการตรวจและคะแนนนี้หรือไม่');
  if (!confirm.isConfirmed) return;
  
  saving.value = true;
  saveSuccess.value = false;
  
  try {
    const result = await gradingApi.gradeSubmission(submissionId.value, {
      grade: gradeForm.grade,
      feedback: gradeForm.feedback || undefined
    });
    
    // Update local state
    submission.value = { ...submission.value!, ...result, status: 'graded' };
    
    // Show success and redirect
    await showSuccess('บันทึกคะแนนเรียบร้อย', 'กำลังกลับไปหน้ารายการงาน...');
    router.push('/grading');
     
    
  } catch (e: any) {
    await showError('บันทึกไม่สำเร็จ', e.message);
  } finally {
    saving.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.grading-detail-page {
  min-height: 100vh;
  background-color: #f1f5f9;
}

/* Main content styles removed (global) */

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 24px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #6366f1;
}

/* Info Cards */
.info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.assignment-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.meta-row {
  display: flex;
  gap: 20px;
  color: #64748b;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.description {
  color: #475569;
  line-height: 1.7;
}

/* Student Header */
.student-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.student-info h4 {
  margin: 0 0 4px;
  font-weight: 600;
}

.late-badge {
  margin-left: auto;
  background: #fee2e2;
  color: #dc2626;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.submission-time {
  color: #64748b;
  font-size: 0.9rem;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.content-text {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  white-space: pre-wrap;
  line-height: 1.7;
  color: #334155;
}

.file-attachment {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
}

.file-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #0ea5e9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.file-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-name {
  font-weight: 500;
  color: #0369a1;
}

.no-content {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.no-content i {
  font-size: 3rem;
  margin-bottom: 12px;
}

/* Grading Panel */
.grading-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 100px;
}

.panel-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.current-grade {
  text-align: center;
  background: #f0fdf4;
  border-radius: 12px;
  padding: 20px;
}

.grade-badge {
  margin-bottom: 8px;
}

.grade-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #059669;
}

.grade-max {
  font-size: 1.25rem;
  color: #64748b;
}

.grade-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.grade-input {
  width: 100px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border-radius: 12px;
}

.grade-max-label {
  font-size: 1.25rem;
  color: #64748b;
}

.feedback-input {
  border-radius: 12px;
  resize: none;
}

.quick-feedback {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.quick-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #f1f5f9;
  border-color: #6366f1;
}

.btn-save {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.empty-state-card {
  background: white;
  border-radius: 20px;
  padding: 50px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  max-width: 500px;
  width: 100%;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon i {
  font-size: 2.5rem;
  color: #94a3b8;
}

.empty-state-card h3 {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.assignment-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
}

.assignment-info h5 {
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}
</style>
