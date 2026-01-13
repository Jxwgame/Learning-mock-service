<template>
  <div class="grading-page">
  <div class="grading-page">
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Page Header -->
      <div class="page-header" :class="{ 'assignment-context': assignmentId }">
        <div class="header-content d-flex justify-content-between align-items-center">
          <div>
            <h1><i class="bi bi-clipboard-check me-2"></i>ตรวจงานและให้คะแนน</h1>
            <p v-if="assignmentId && currentAssignment">
              รายการส่งงานสำหรับ: <strong>{{ currentAssignment.title }}</strong>
            </p>
            <p v-else>รายการงานที่ส่งมาจากนักเรียน</p>
          </div>
          <router-link v-if="assignmentId" to="/grading" class="btn btn-outline-white btn-sm">
            <i class="bi bi-arrow-left me-1"></i>ดูทั้งหมด
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row" v-if="!loading">
        <div class="stat-card pending">
          <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">รอตรวจ</div>
          </div>
        </div>
        <div class="stat-card graded">
          <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ gradedCount }}</div>
            <div class="stat-label">ตรวจแล้ว</div>
          </div>
        </div>
        <div class="stat-card late">
          <div class="stat-icon"><i class="bi bi-clock-history"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ lateCount }}</div>
            <div class="stat-label">ส่งสาย</div>
          </div>
        </div>
        <div class="stat-card total">
          <div class="stat-icon"><i class="bi bi-file-earmark-text"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ allSubmissions.length }}</div>
            <div class="stat-label">ทั้งหมด</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-5">
        <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem;"></i>
        <h4 class="mt-3">เกิดข้อผิดพลาด</h4>
        <p class="text-muted">{{ error }}</p>
        <button class="btn btn-outline-primary" @click="fetchData">ลองใหม่</button>
      </div>

      <!-- Content -->
      <div v-else class="content-section">
        <!-- Filter Tabs -->
        <div class="filter-row">
          <div class="filter-tabs">
            <button 
              class="filter-btn" 
              :class="{ active: filter === 'all' }"
              @click="filter = 'all'"
            >
              ทั้งหมด
            </button>
            <button 
              class="filter-btn" 
              :class="{ active: filter === 'pending' }"
              @click="filter = 'pending'"
            >
              รอตรวจ
            </button>
            <button 
              class="filter-btn" 
              :class="{ active: filter === 'graded' }"
              @click="filter = 'graded'"
            >
              ตรวจแล้ว
            </button>
          </div>
          
          <!-- Course Filter -->
          <select v-model="selectedCourseId" class="form-select course-select">
            <option :value="null">ทุกคอร์ส</option>
            <option v-for="c in courses" :key="c.course_id" :value="c.course_id">
              {{ c.course_name }}
            </option>
          </select>
        </div>

        <!-- Empty State -->
        <div v-if="filteredSubmissions.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <h4>ไม่พบงานที่ต้องตรวจ</h4>
          <p class="text-muted">ยังไม่มีนักเรียนส่งงานมา</p>
        </div>

        <!-- Submissions List -->
        <div v-else class="submissions-list">
          <div 
            v-for="sub in filteredSubmissions" 
            :key="sub.submission_id"
            class="submission-card"
          >
            <div class="submission-main">
              <div class="student-avatar">
                {{ getInitials(sub.user_first_name, sub.user_last_name) }}
              </div>
              <div class="submission-info">
                <div class="student-name">
                  {{ sub.user_first_name || '' }} {{ sub.user_last_name || '' }}
                  <span v-if="!sub.user_first_name && !sub.user_last_name">{{ sub.user_email }}</span>
                </div>
                <div class="assignment-name">{{ sub.assignment_title || 'Assignment' }}</div>
                <div class="submission-meta">
                  <span><i class="bi bi-clock me-1"></i>{{ formatDate(sub.submission_date) }}</span>
                  <span v-if="isLate(sub)" class="late-badge">
                    <i class="bi bi-exclamation-triangle me-1"></i>ส่งสาย
                  </span>
                </div>
              </div>
            </div>
            
            <div class="submission-status">
              <span v-if="sub.status === 'graded'" class="status-badge graded">
                <i class="bi bi-check-circle me-1"></i>
                {{ sub.grade }}/{{ sub.max_score || 10 }}
              </span>
              <span v-else class="status-badge pending">
                <i class="bi bi-hourglass-split me-1"></i>
                รอตรวจ
              </span>
            </div>

            <div class="submission-actions">
              <router-link 
                :to="`/grading/${sub.assignment_id}/submissions/${sub.submission_id}`"
                class="btn btn-grade"
              >
                <i class="bi bi-pencil-square me-1"></i>
                {{ sub.status === 'graded' ? 'ดู/แก้ไข' : 'ตรวจเลย' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import * as gradingApi from './grading.api';
import type { Submission, Assignment } from './grading.api';
import { getCourses } from '../courses/courses.api'; 

// Sidebar state removed (global)

const route = useRoute();

// Data
const loading = ref(true);
const error = ref<string | null>(null);
const filter = ref<'all' | 'pending' | 'graded'>('all');
const selectedCourseId = ref<number | null>(null);
const assignmentId = computed(() => route.params.assignmentId ? Number(route.params.assignmentId) : null);
const currentAssignment = ref<Assignment | null>(null);

interface ExtendedSubmission extends Submission {
  assignment_title?: string;
  course_id?: number;
  course_name?: string;
  max_score?: number;
  due_date?: string;
}

const allSubmissions = ref<ExtendedSubmission[]>([]);
const courses = ref<{ course_id: number; course_name: string }[]>([]);

// Computed
const pendingCount = computed(() => allSubmissions.value.filter(s => s.status === 'submitted').length);
const gradedCount = computed(() => allSubmissions.value.filter(s => s.status === 'graded').length);
const lateCount = computed(() => allSubmissions.value.filter(s => isLate(s)).length);

const filteredSubmissions = computed(() => {
  let result = allSubmissions.value;
  
  if (filter.value === 'pending') {
    result = result.filter(s => s.status === 'submitted');
  } else if (filter.value === 'graded') {
    result = result.filter(s => s.status === 'graded');
  }
  
  if (selectedCourseId.value) {
    result = result.filter(s => s.course_id === selectedCourseId.value);
  }
  
  return result;
});

// Helpers
function getInitials(first?: string, last?: string): string {
  const f = first?.[0] || '';
  const l = last?.[0] || '';
  return (f + l).toUpperCase() || 'U';
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isLate(sub: ExtendedSubmission): boolean {
  if (!sub.due_date || !sub.submission_date) return false;
  const submitted = new Date(sub.submission_date);
  if (isNaN(submitted.getTime())) return false;
  return submitted > new Date(sub.due_date);
}

// Fetch data
async function fetchData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Get all courses (for instructor)
    // Get courses based on role logic
    // For instructors: use getMyTeachingCourses to ensure we only try to fetch assignments for accessible courses
    // For admins: getCourses (all active) is fine, as admin has universal access
    let allCourses: { course_id: number; course_name: string }[] = [];
    
    // We can check role from existing logic or try teaching courses first
    // Since this is "Grading" page, usually implies Instructor view.
    // Let's rely on courseInstructorsApi which returns what the user CAN teach.
    // If strict admin wants to see EVERYTHING, they might typically use the Admin -> Course Management.
    // But for Grading Dashboard, usually 'My Courses' is safer and more relevant.
    
    try {
        const teachingCourses = await import('../courses/courseInstructors.api').then(m => m.courseInstructorsApi.getMyTeachingCourses());
        allCourses = teachingCourses.map((item: any) => ({ 
            course_id: item.course.course_id, 
            course_name: item.course.course_name 
        }));
    } catch (e) {
        // Fallback or if user is purely admin without specific teaching assignment?
        // But getMyTeachingCourses returns global courses for Admin? Currently it wraps /me/courses/teaching.
        // If /me/courses/teaching returns empty for Admin (who isn't assigned), then Admin sees nothing.
        // Let's fallback to getCourses() ONLY if the list is empty AND user is Admin.
        // But simpler: just try getCourses if the first fail or returns empty?
        console.warn('Failed to fetch teaching courses, falling back to all courses', e);
        const fallback = await getCourses();
         allCourses = fallback.map(c => ({ course_id: c.course_id, course_name: c.course_name }));
    }
    
    courses.value = allCourses;
    
    // If we have a specific assignment ID, load just that one
    if (assignmentId.value) {
      try {
        currentAssignment.value = await gradingApi.getAssignment(assignmentId.value);
        const subs = await gradingApi.listSubmissions(assignmentId.value);
        allSubmissions.value = subs.map(s => ({
          ...s,
          assignment_title: currentAssignment.value?.title,
          max_score: currentAssignment.value?.max_score
        }));
        loading.value = false;
        return; // Early return for specific assignment view
      } catch (e: any) {
        console.error('Failed to load specific assignment submissions:', e);
        error.value = 'ไม่สามารถโหลดข้อมูลแบบฝึกหัดได้';
        loading.value = false;
        return;
      }
    }

    const submissions: ExtendedSubmission[] = [];
    
    // For each course, get assignments and their submissions
    for (const course of allCourses) {
      try {
        const assignments = await gradingApi.listCourseAssignments(course.course_id);
        
        for (const assignment of assignments) {
          try {
            const subs = await gradingApi.listSubmissions(assignment.assignment_id);
            
            for (const sub of subs) {
              submissions.push({
                ...sub,
                assignment_title: assignment.title,
                course_id: course.course_id,
                course_name: course.course_name,
                max_score: assignment.max_score,
                due_date: assignment.due_date
              });
            }
          } catch (e) {
            // May not have permission for some assignments
            console.warn(`Could not load submissions for assignment ${assignment.assignment_id}`);
          }
        }
      } catch (e) {
        console.warn(`Could not load assignments for course ${course.course_id}`);
      }
    }
    
    // Sort by submission_date (newest first)
    submissions.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());
    
    allSubmissions.value = submissions;
    
  } catch (e: any) {
    console.error(e);
    error.value = e.message || 'ไม่สามารถโหลดข้อมูลได้';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);

// Re-fetch when assignmentId changes (e.g. navigation)
watch(() => route.params.assignmentId, () => {
  fetchData();
});
</script>

<style scoped>
.grading-page {
  min-height: 100vh;
  background-color: #f1f5f9;
}

/* Main content styles removed (global) */

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header - Green Gradient */
.page-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
  transition: all 0.3s ease;
}

.page-header.assignment-context {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  box-shadow: 0 4px 20px rgba(2, 132, 199, 0.15);
}

.btn-outline-white {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: white;
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  color: white;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
}

.page-header p {
  opacity: 0.9;
  margin: 0;
  color: white;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: none; /* Remove shadow for cleaner look */
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card.pending .stat-icon { background: #fffbeb; color: #d97706; }
.stat-card.graded .stat-icon { background: #f0fdf4; color: #059669; }
.stat-card.late .stat-icon { background: #fef2f2; color: #ef4444; }
.stat-card.total .stat-icon { background: #f0f9ff; color: #0284c7; }

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

/* Filter Row */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  background: white;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  color: #64748b;
}

.filter-btn.active {
  background: #10b981;
  color: white;
}

.course-select {
  max-width: 250px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  color: #334155;
}

.course-select:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    outline: none;
}

/* Submissions List */
.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  /* No hover transform */
}

.submission-main {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
}

.student-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  font-size: 1.1rem;
}

.submission-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
  font-size: 1.05rem;
}

.assignment-name {
  font-size: 0.95rem;
  color: #10b981;
  font-weight: 500;
  margin-bottom: 6px;
}

.submission-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #64748b;
}

.late-badge {
  color: #ef4444;
  font-weight: 600;
  background: #fef2f2;
  padding: 0 6px;
  border-radius: 4px;
}

.submission-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fffbeb;
  color: #b45309;
}

.status-badge.graded {
  background: #f0fdf4;
  color: #166534;
}

.submission-actions {
  flex-shrink: 0;
}

.btn-grade {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  /* No hover transform, just color change */
}

.btn-grade:hover {
  background: #059669;
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.empty-state i {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state h4 {
  color: #0f172a;
  font-weight: 700;
}
</style>

