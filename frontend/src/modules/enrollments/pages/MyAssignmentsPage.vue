<template>
  <div class="my-assignments-page">
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1><i class="bi bi-clipboard-check me-2"></i>แบบฝึกหัดของฉัน</h1>
          <p>รวมแบบฝึกหัดจากทุกคอร์สที่ลงทะเบียน</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">กำลังโหลดแบบฝึกหัด...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="empty-state-card">
        <div class="empty-icon error">
          <i class="bi bi-exclamation-circle"></i>
        </div>
        <h3>เกิดข้อผิดพลาด</h3>
        <p class="text-muted">{{ error }}</p>
        <button class="btn-shadcn primary" @click="fetchData">
          <i class="bi bi-arrow-clockwise me-2"></i>ลองใหม่
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="allAssignments.length === 0" class="empty-state-card">
        <div class="empty-icon">
          <i class="bi bi-clipboard-x"></i>
        </div>
        <h3>ยังไม่มีแบบฝึกหัด</h3>
        <p class="text-muted">คุณยังไม่มีแบบฝึกหัดที่ต้องทำ</p>
        <router-link to="/my-courses" class="btn-shadcn primary">
          <i class="bi bi-book me-2"></i>ไปยังคอร์สของฉัน
        </router-link>
      </div>

      <!-- Assignments Content -->
      <div v-else class="assignments-section">
        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon all"><i class="bi bi-file-text"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ allAssignments.length }}</div>
              <div class="stat-label">ทั้งหมด</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon pending"><i class="bi bi-clock"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">รอส่ง</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon submitted"><i class="bi bi-check-circle"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ submittedCount }}</div>
              <div class="stat-label">ส่งแล้ว</div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button 
            type="button"
            class="btn-shadcn filter" 
            :class="{ active: filter === 'all' }"
            @click="filter = 'all'"
          >
            ทั้งหมด
          </button>
          <button 
            type="button"
            class="btn-shadcn filter" 
            :class="{ active: filter === 'pending' }"
            @click="filter = 'pending'"
          >
            รอส่ง
          </button>
          <button 
            type="button"
            class="btn-shadcn filter" 
            :class="{ active: filter === 'submitted' }"
            @click="filter = 'submitted'"
          >
            ส่งแล้ว
          </button>
        </div>

        <!-- Grouped by Course -->
        <div v-for="(group, courseName) in groupedAssignments" :key="courseName" class="course-group">
          <div class="course-group-header">
            <i class="bi bi-journal-bookmark me-2"></i>
            {{ courseName }}
          </div>
          
          <div class="assignments-list">
            <router-link 
              v-for="assign in group"
              :key="assign.assignment_id"
              :to="`/learning/${assign.course_id}/assignments/${assign.assignment_id}`"
              class="assignment-item"
            >
              <div class="assignment-icon" :class="assign.submitted ? 'submitted' : 'pending'">
                <i :class="assign.submitted ? 'bi bi-check-circle-fill' : 'bi bi-file-earmark-text'"></i>
              </div>
              <div class="assignment-info">
                <div class="assignment-title">{{ assign.title }}</div>
                <div class="assignment-meta">
                  <span class="meta-item">
                    <i class="bi bi-star me-1"></i>
                    {{ assign.max_score }} คะแนน
                  </span>
                  <span v-if="assign.due_date" class="meta-item" :class="{ 'text-danger': isOverdue(assign.due_date) }">
                    <i class="bi bi-clock me-1"></i>
                    {{ formatDate(assign.due_date) }}
                  </span>
                  <span v-if="assign.submitted" class="status-badge submitted">ส่งแล้ว</span>
                  <span v-else class="status-badge pending">รอส่ง</span>
                </div>
              </div>
              <i class="bi bi-chevron-right arrow-icon"></i>
            </router-link>
          </div>
        </div>
      </div>
      </div>
  </div>
</template>

<script setup lang="ts">
// Sidebar state removed (global)
import { ref, computed, onMounted } from 'vue';
import { useAssignmentsStore } from '../../assignments/assignments.store';
import type { Assignment } from '../../assignments/assignments.api';
import { getMyCourses } from '../../enrollments/enrollments.api'; // Import getMyCourses

interface AssignmentWithCourse extends Assignment {
  course_id?: number;
  course_name?: string;
  submitted?: boolean;
}

const assignmentsStore = useAssignmentsStore();

const loading = ref(true);
const error = ref<string | null>(null);
const filter = ref<'all' | 'pending' | 'submitted'>('all');
const allAssignments = ref<AssignmentWithCourse[]>([]);

const pendingCount = computed(() => allAssignments.value.filter(a => !a.submitted).length);
const submittedCount = computed(() => allAssignments.value.filter(a => a.submitted).length);

const filteredAssignments = computed(() => {
  if (filter.value === 'pending') return allAssignments.value.filter(a => !a.submitted);
  if (filter.value === 'submitted') return allAssignments.value.filter(a => a.submitted);
  return allAssignments.value;
});

const groupedAssignments = computed(() => {
  const groups: Record<string, AssignmentWithCourse[]> = {};
  for (const assign of filteredAssignments.value) {
    const key = assign.course_name || 'General'; // Handle undefined course_name
    if (!groups[key]) groups[key] = [];
    groups[key].push(assign);
  }
  return groups;
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

async function fetchData() {
  loading.value = true;
  error.value = null;
  
  try {
    const myCourses = await getMyCourses();
    const assignmentsList: AssignmentWithCourse[] = [];
    
    for (const course of myCourses) {
      try {
        await assignmentsStore.fetchAssignments(course.course_id);
        const courseAssignments = assignmentsStore.assignments;
        
        for (const assign of courseAssignments) {
          let submitted = false;
          try {
            // Store action returns promise of data now, but safe fallback:
             const subs = await assignmentsStore.fetchMySubmissions(assign.assignment_id);
             // Verify if subs is array
             if (Array.isArray(subs)) {
                 submitted = subs.length > 0;
             } else {
                 // Fallback to store state if return is void
                 submitted = assignmentsStore.mySubmissions.length > 0;
             }
          } catch { /* ignore */ }
          
          assignmentsList.push({
            assignment_id: assign.assignment_id, // Ensure properties match
            course_id: course.course_id,
            course_name: course.course_name || `Course ${course.course_id}`,
            title: assign.title,
            description: assign.description,
            max_score: assign.max_score,
            due_date: assign.due_date,
            lesson_id: assign.lesson_id,
            submitted
          });
        }
      } catch (e) {
        console.warn(`Failed to load assignments for course ${course.course_id}`, e);
      }
    }
    
    allAssignments.value = assignmentsList;
    
  } catch (e: any) {
    console.error(e);
    error.value = e.message || 'ไม่สามารถโหลดแบบฝึกหัดได้';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.my-assignments-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Main content styles removed (global) */

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.page-header p {
  opacity: 0.9;
  margin: 0;
}

/* ShadCN-like Buttons */
.btn-shadcn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.btn-shadcn.primary {
  background: #059669;
  color: white;
}

.btn-shadcn.primary:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.btn-shadcn.secondary {
  background: white;
  color: #0f172a;
  border: 1px solid #e2e8f0;
}

.btn-shadcn.secondary:hover {
  background: #f8fafc;
}

.btn-shadcn.filter {
  padding: 8px 16px;
  background: transparent;
  color: #64748b;
  border: 1px solid transparent;
}

.btn-shadcn.filter.active {
  background: #059669; /* Emerald 600 */
  color: white;
}

.btn-shadcn.filter:hover:not(.active) {
  background: #ecfdf5; /* Emerald 50 */
  color: #059669;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* Updated Stat Icons to Green/Neutral Mix or keep distinct? User said "Green Theme". 
   Let's ensure "Submitted" is very Green. Others can be complementary. */
.stat-icon.all { background: #ecfdf5; color: #059669; }
.stat-icon.pending { background: #fef3c7; color: #d97706; } /* Keep Pending Orange */
.stat-icon.submitted { background: #dbfceb; color: #16a34a; }

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

/* Course Group */
.course-group {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.course-group-header {
  background: #f8fafc;
  padding: 14px 20px;
  font-weight: 600;
  color: #0f172a;
  border-bottom: 1px solid #e2e8f0;
}

/* Assignment Items */
.assignments-list {
  padding: 0;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.assignment-item:last-child {
  border-bottom: none;
}

.assignment-item:hover {
  background: #f8fafc;
}

.assignment-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.assignment-icon.pending {
  background: #fef3c7;
  color: #d97706;
}

.assignment-icon.submitted {
  background: #d1fae5;
  color: #059669;
}

.assignment-info {
  flex: 1;
  min-width: 0;
}

.assignment-title {
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 4px;
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: #64748b;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.submitted {
  background: #d1fae5;
  color: #059669;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.arrow-icon {
  color: #94a3b8;
}

/* Empty State */
.empty-state-card {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: #ecfdf5; /* Green tint */
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon i {
  font-size: 2.5rem;
  color: #10b981;
}

.empty-icon.error {
    background: #fef2f2;
}
.empty-icon.error i {
  color: #ef4444;
}

.empty-state-card h3 {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}
</style>
