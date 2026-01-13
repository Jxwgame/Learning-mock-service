<template>
  <div class="assignments-page">
    <!-- Sidebar -->
  <div class="assignments-page">
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1><i class="bi bi-file-earmark-text me-2"></i>จัดการแบบฝึกหัด</h1>
          <p>รวมแบบฝึกหัดจากทุกคอร์สที่คุณสอน</p>
        </div>
        <router-link to="/grading" class="btn btn-outline-light">
          <i class="bi bi-clipboard-check me-2"></i>ไปหน้าตรวจงาน
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">กำลังโหลดแบบฝึกหัด...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="localAssignments.length === 0" class="empty-state">
        <i class="bi bi-file-earmark-x"></i>
        <h4>ยังไม่มีแบบฝึกหัด</h4>
        <p class="text-muted">คุณยังไม่ได้สร้างแบบฝึกหัดในรายวิชาใดๆ</p>
        <router-link to="/courses/teaching" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>ไปที่รายวิชาเพื่อสร้าง
        </router-link>
      </div>

      <!-- Assignment List -->
      <div v-else class="content-section">
        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-file-text"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ localAssignments.length }}</div>
              <div class="stat-label">แบบฝึกหัดทั้งหมด</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon overdue"><i class="bi bi-clock-history"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ overdueCount }}</div>
              <div class="stat-label">เกินกำหนด</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon courses"><i class="bi bi-journal-bookmark"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ Object.keys(courseMap).length }}</div>
              <div class="stat-label">คอร์สที่สอน</div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-card">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>ชื่อแบบฝึกหัด</th>
                  <th>คอร์ส</th>
                  <th>บทเรียน</th>
                  <th>กำหนดส่ง</th>
                  <th>คะแนน</th>
                  <th class="text-end">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="assign in localAssignments" :key="assign.assignment_id">
                  <td>
                    <div class="fw-semibold">{{ assign.title }}</div>
                    <small class="text-muted">{{ truncate(assign.description, 50) }}</small>
                  </td>
                  <td>
                    <span class="badge bg-primary-soft">{{ getCourseName(assign.course_id) }}</span>
                  </td>
                  <td>{{ assign.lesson?.lesson_title || '-' }}</td>
                  <td :class="isOverdue(assign.due_date) ? 'text-danger' : ''">
                    {{ formatDate(assign.due_date) }}
                  </td>
                  <td>{{ assign.max_score }}</td>
                  <td class="text-end">
                    <router-link 
                      :to="`/grading/assignment/${assign.assignment_id}`" 
                      class="btn btn-sm btn-primary me-2"
                      title="ดูงานที่ส่ง"
                    >
                      <i class="bi bi-people"></i>
                    </router-link>
                    <button class="btn btn-sm btn-outline-secondary" @click="goToEdit(assign)" title="แก้ไข">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAssignmentsStore } from '../assignments.store';
import { useCourseInstructorsStore } from '../../courses/courseInstructors.store';
import type { Assignment } from '../assignments.api';

const assignmentsStore = useAssignmentsStore();
const instructorsStore = useCourseInstructorsStore();
const router = useRouter();

// Data
const loading = ref(true);
type AnyAssignment = Assignment & { course_id?: number; lesson?: { lesson_title: string } };
const localAssignments = ref<AnyAssignment[]>([]);
const courseMap = ref<Record<number, string>>({});

// Computed
const overdueCount = computed(() => localAssignments.value.filter(a => isOverdue(a.due_date)).length);

// Functions
function truncate(text?: string, len = 50): string {
  if (!text) return '';
  return text.length > len ? text.substring(0, len) + '...' : text;
}

function getCourseName(id?: number): string {
  if (!id) return '-';
  return courseMap.value[id] || `#${id}`;
}

function formatDate(date?: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function isOverdue(date?: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

function goToEdit(assign: AnyAssignment) {
  if (assign.course_id) {
    router.push(`/courses/instructor/${assign.course_id}?tab=lessons`);
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    console.log("[AssignmentsDashboard] Fetching teaching courses...");
    await instructorsStore.fetchMyTeachingCourses();
    const courses = instructorsStore.myTeachingCourses;
    console.log("[AssignmentsDashboard] Teaching courses fetched:", courses);
    
    courseMap.value = {};
    courses.forEach((c: any) => {
      courseMap.value[c.course_id] = c.course_name;
    });

    const all: AnyAssignment[] = [];
    for (const c of courses) {
      try {
        console.log(`[AssignmentsDashboard] Fetching assignments for course ${c.course_id}`);
        const results = await assignmentsStore.fetchPublishedAssignments(c.course_id);
        if (Array.isArray(results)) {
          results.forEach((a: any) => {
            all.push({ ...a, course_id: c.course_id });
          });
        }
      } catch (e: any) {
        console.warn(`[AssignmentsDashboard] Failed to load assignments for course ${c.course_id}`, e);
        if (e?.response?.status === 401) {
             console.error("[AssignmentsDashboard] 401 UNAUTHORIZED for course", c.course_id);
        }
      }
    }
    
    localAssignments.value = all;
  } catch (e: any) {
    console.error("[AssignmentsDashboard] Failed to load global assignments", e);
    if (e?.response?.status === 401) {
         console.error("[AssignmentsDashboard] 401 UNAUTHORIZED on fetchMyTeachingCourses");
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.assignments-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e2e8f0;
  /* No animation/transition */
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.overdue { background: #fef2f2; color: #ef4444; }
.stat-icon.courses { background: #f0fdf4; color: #10b981; }

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

/* Table */
.table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table th {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  font-size: 0.8rem;
  padding: 16px 24px;
  letter-spacing: 0.02em;
}

.table td {
  padding: 16px 24px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.table tr:last-child td {
  border-bottom: none;
}

.badge.bg-primary-soft {
  background: #f0fdf4;
  color: #166534; /* Darker green for text readability */
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
}

/* Empty State Modern - Clean & Static */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.empty-state i {
  font-size: 3.5rem;
  color: #cbd5e1; /* Subtle gray */
  margin-bottom: 20px;
  display: block;
}

.empty-state h4 {
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 8px;
}

.empty-state p {
  color: #64748b;
  max-width: 400px;
  margin: 0 auto 24px;
}

/* Buttons */
.btn-primary {
  background: #10b981; /* Emerald 500 */
  border: 1px solid #10b981;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  /* No transition/transform */
}

.btn-primary:hover {
  background: #059669; /* Emerald 600 */
  border-color: #059669;
}

.btn-outline-light {
    border: 1px solid #cbd5e1;
    color: #475569;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
}

.btn-outline-light:hover {
    background: #f8fafc;
    color: #334155;
    border-color: #cbd5e1;
}

.btn-outline-secondary {
  color: #64748b;
  border-color: #cbd5e1;
}

.btn-outline-secondary:hover {
  background: #f1f5f9;
  color: #0f172a;
}
</style>
