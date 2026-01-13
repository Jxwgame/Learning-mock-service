<template>
  <div class="assignment-detail-page">
    <div class="content-wrapper">
       <!-- Back Button -->
       <button class="btn btn-outline-secondary mb-4" @click="$router.back()">
        <i class="fas fa-arrow-left me-1"></i> กลับ
      </button>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="assignment" class="row">
        <!-- Sidebar / Info -->
        <div class="col-md-4 order-md-2 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
                <h5 class="card-title text-primary mb-3">รายละเอียดงาน</h5>
                <ul class="list-unstyled">
                    <li class="mb-2">
                        <i class="fas fa-calendar-alt text-muted me-2"></i>
                        <strong>กำหนดส่ง:</strong> <br>
                        <span class="ms-4 text-secondary">{{ assignment.due_date ? formatDate(assignment.due_date) : 'ไม่มีกำหนด' }}</span>
                    </li>
                    <li class="mb-2">
                        <i class="fas fa-star text-muted me-2"></i>
                        <strong>คะแนนเต็ม:</strong> {{ assignment.max_score || 0 }} คะแนน
                    </li>
                </ul>
                <hr>
                <!-- Instructor Actions -->
                <div v-if="isInstructor">
                   <h6 class="fw-bold mb-2">สำหรับผู้สอน</h6>
                   <button class="btn btn-outline-primary w-100 mb-2" @click="fetchSubmissions">
                     <i class="fas fa-sync-alt me-1"></i> รีโหลดการส่งงาน
                   </button>
                   <div class="alert alert-info py-2 small">
                      <i class="fas fa-info-circle me-1"></i> นักเรียนส่งแล้ว {{ submissions.length }} คน
                   </div>
                </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-8 order-md-1">
            <!-- Assignment Content -->
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body p-4">
                    <h1 class="h3 fw-bold mb-3">{{ assignment.title }}</h1>
                    <div class="assignment-description text-muted mb-4" style="white-space: pre-wrap;">
                        {{ assignment.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}
                    </div>
                </div>
            </div>

            <!-- Learner: Submission Form -->
            <div v-if="!isInstructor" class="card shadow-sm border-0 mb-4">
                 <div class="card-header bg-white py-3">
                    <h5 class="mb-0"><i class="fas fa-paper-plane me-2 text-primary"></i>ส่งงานของฉัน</h5>
                 </div>
                 <div class="card-body">
                    <div v-if="mySubmission" class="submission-status mb-4">
                        <div class="alert" :class="mySubmission.grade !== null ? 'alert-success' : 'alert-warning'">
                            <h6 class="alert-heading fw-bold">
                                <i class="fas" :class="mySubmission.grade !== null ? 'fa-check-circle' : 'fa-clock'"></i>
                                {{ mySubmission.grade !== null ? 'ตรวจแล้ว' : 'รอการตรวจ' }}
                            </h6>
                            <p class="mb-0">ส่งเมื่อ: {{ formatDate(mySubmission.submission_date) }}</p>
                            <p v-if="mySubmission.grade !== null" class="mt-2 fw-bold">
                                คะแนนที่ได้: {{ mySubmission.grade }} / {{ assignment.max_score }}
                            </p>
                            <div v-if="mySubmission.comments" class="mt-2 p-2 bg-white rounded border">
                                <small class="text-muted d-block">คอมเมนต์จากผู้สอน:</small>
                                {{ mySubmission.comments }}
                            </div>
                        </div>
                    </div>

                    <form @submit.prevent="handleSubmitWork">
                        <div class="mb-3">
                            <label class="form-label">ลิงก์ส่งงาน / ไฟล์แนบ</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-link"></i></span>
                                <input type="url" class="form-control" v-model="submissionForm.file_url" placeholder="https://..." required>
                            </div>
                            <div class="form-text">กรอกลิงก์ Google Drive, GitHub หรือลิงก์ผลงานของคุณ</div>
                        </div>
                         <div class="mb-3">
                            <label class="form-label">ข้อความเพิ่มเติม (Optional)</label>
                            <textarea class="form-control" rows="2" v-model="submissionForm.comments"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" :disabled="submitting || !!(mySubmission && mySubmission.grade !== null)">
                            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                            {{ mySubmission ? 'ส่งงานใหม่ (Resubmit)' : 'ส่งงาน' }}
                        </button>
                    </form>
                 </div>
            </div>

            <!-- Instructor: Grading List -->
            <div v-else class="card shadow-sm border-0">
                <div class="card-header bg-white py-3">
                    <h5 class="mb-0"><i class="fas fa-user-graduate me-2 text-primary"></i>รายการส่งงานของนักเรียน</h5>
                </div>
                <div class="card-body p-0">
                    <div v-if="submissions.length === 0" class="text-center py-4 text-muted">
                        ยังไม่มีใครส่งงาน
                    </div>
                    <div v-else class="list-group list-group-flush">
                        <div v-for="sub in submissions" :key="sub.submission_id" class="list-group-item p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="mb-1 fw-bold">
                                        {{ sub.User ? `${sub.User.first_name} ${sub.User.last_name}` : `Student ID: ${sub.user_id}` }}
                                    </h6>
                                    <p class="mb-1 text-muted small" v-if="sub.User">
                                        <i class="fas fa-envelope me-1"></i> {{ sub.User.email }}
                                    </p>
                                    <p class="mb-1 text-muted small"><i class="far fa-clock me-1"></i>ส่งเมื่อ: {{ formatDate(sub.submission_date) }}</p>
                                    <a :href="sub.file_url || '#'" target="_blank" class="btn btn-sm btn-outline-primary mt-2">
                                        <i class="fas fa-external-link-alt me-1"></i> เปิดดูงาน
                                    </a>
                                    <div v-if="sub.comments" class="mt-2 small text-muted fst-italic">"{{ sub.comments }}"</div>
                                </div>
                                <div class="text-end" style="min-width: 150px;">
                                    <label class="form-label small mb-1">ให้คะแนน (เต็ม {{ assignment.max_score }})</label>
                                    <div class="input-group input-group-sm">
                                        <input type="number" class="form-control" v-model.number="gradingForm[sub.submission_id]" :placeholder="sub.grade?.toString()" min="0" :max="assignment.max_score || 100">
                                        <button class="btn btn-primary" @click="handleGrade(sub.submission_id)" :disabled="gradingLoading === sub.submission_id">
                                            <i class="fas fa-save"></i>
                                        </button>
                                    </div>
                                    <div v-if="sub.grade !== null" class="mt-1 text-success small">
                                        <i class="fas fa-check"></i> ตรวจแล้ว
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { usePermissions } from '../../../core/permissions/permissions';
import { useRoute } from 'vue-router';
import { assignmentsApi, type Assignment, type AssignmentSubmission } from '../assignments.api';
import { showSuccess, showError } from '../../../core/utils/swal';

const route = useRoute();
const { isInstructor: isInstructorPermission } = usePermissions();

const assignment = ref<Assignment | null>(null);
const submissions = ref<AssignmentSubmission[]>([]);
const mySubmission = ref<AssignmentSubmission | null>(null);

const loading = ref(false);
const submitting = ref(false);
const gradingLoading = ref<number | null>(null);
const error = ref<string | null>(null);

const submissionForm = reactive({
    file_url: '',
    comments: ''
});

const gradingForm = reactive<Record<number, number>>({});

const isInstructor = computed(() => isInstructorPermission.value);
const assignmentId = Number(route.params.assignmentId);

// Logic for lateness
const isLate = computed(() => {
    if (!assignment.value?.due_date) return false;
    return new Date() > new Date(assignment.value.due_date);
});

async function fetchAssignment() {
    loading.value = true;
    try {
        assignment.value = await assignmentsApi.getAssignmentById(assignmentId);
        
        if (!assignment.value) throw new Error("Assignment not found");

        if (isInstructor.value) {
            await fetchSubmissions();
        } else {
            await fetchMySubmission();
        }

    } catch (e: any) {
        // If 404/403, might be permission or not found
        error.value = e.response?.data?.error || e.message || "Failed to load assignment";
    } finally {
        loading.value = false;
    }
}

async function fetchMySubmission() {
    try {
       const subs = await assignmentsApi.listMySubmissions(assignmentId);
       if (subs.length > 0) {
           const sub = subs[0];
           if (sub) {
               mySubmission.value = sub; // Latest one
               submissionForm.file_url = sub.file_url || '';
               submissionForm.comments = sub.comments || '';
           }
       }
    } catch(e) { console.error(e); }
}

async function fetchSubmissions() {
    try {
        submissions.value = await assignmentsApi.listSubmissionsForAssignment(assignmentId);
        // init grading form
        submissions.value.forEach(s => {
            if (s.grade !== null) gradingForm[s.submission_id] = s.grade;
        });
    } catch(e) { console.error(e); }
}

async function handleSubmitWork() {
    if (!submissionForm.file_url) return;
    
    // Check if late and warn
    if (isLate.value && !mySubmission.value) { 
         // Warn if needed, but backend allows it.
    }

    submitting.value = true;
    try {
        await assignmentsApi.createSubmission(assignmentId, {
            file_url: submissionForm.file_url,
            comments: submissionForm.comments
        });
        
        await showSuccess("ส่งงานเรียบร้อยแล้ว!", isLate.value ? "คุณส่งงานช้ากว่ากำหนด แต่ระบบบันทึกให้แล้ว" : "ระบบบันทึกงานของคุณแล้ว");
        await fetchMySubmission();
    } catch (e: any) {
        showError("ส่งงานไม่สำเร็จ", e.message);
    } finally {
        submitting.value = false;
    }
}

async function handleGrade(submissionId: number) {
    const grade = gradingForm[submissionId];
    if (grade === undefined) return;
    
    gradingLoading.value = submissionId;
    try {
        await assignmentsApi.gradeSubmission(submissionId, { grade });
         // Update local list
        const sub = submissions.value.find(s => s.submission_id === submissionId);
        if (sub) sub.grade = grade;
        showSuccess("บันทึกคะแนนเรียบร้อย");
    } catch (e: any) {
        showError("บันทึกคะแนนไม่สำเร็จ", e.message);
    } finally {
        gradingLoading.value = null;
    }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(fetchAssignment);
</script>

<style scoped>
.content-wrapper {
  padding: 30px;
  padding-top: 100px;
}
</style>
