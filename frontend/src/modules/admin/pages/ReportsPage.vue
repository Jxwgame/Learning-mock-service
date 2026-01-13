<template>
  <div class="reports-page">
    <div class="content-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1><i class="bi bi-graph-up me-2"></i>รายงานภาพรวม</h1>
          <p>สรุปข้อมูลและสถิติระบบสำหรับผู้ดูแล</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-light" @click="fetchData">
            <i class="bi bi-arrow-clockwise me-1"></i>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card users">
            <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">ผู้ใช้ทั้งหมด</div>
              <div class="stat-detail">
                <span class="badge bg-primary me-1">{{ stats.learners }} Learners</span>
                <span class="badge bg-info me-1">{{ stats.instructors }} Instructors</span>
                <span class="badge bg-warning">{{ stats.admins }} Admins</span>
              </div>
            </div>
          </div>

          <div class="stat-card courses">
            <div class="stat-icon"><i class="bi bi-journal-richtext"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.totalCourses }}</div>
              <div class="stat-label">คอร์สทั้งหมด</div>
              <div class="stat-detail">
                <span class="badge bg-success me-1">{{ stats.publishedCourses }} Published</span>
                <span class="badge bg-secondary">{{ stats.draftCourses }} Draft</span>
              </div>
            </div>
          </div>

          <div class="stat-card enrollments">
            <div class="stat-icon"><i class="bi bi-person-check-fill"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.totalEnrollments.toLocaleString() }}</div>
              <div class="stat-label">ยอดลงทะเบียน</div>
              <div class="stat-detail text-success">
                <i class="bi bi-arrow-up me-1"></i>Active enrollments
              </div>
            </div>
          </div>

          <div class="stat-card submissions">
            <div class="stat-icon"><i class="bi bi-file-earmark-check"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.totalSubmissions }}</div>
              <div class="stat-label">งานที่ส่ง</div>
              <div class="stat-detail">
                <span class="badge bg-warning text-dark me-1">{{ stats.pendingSubmissions }} รอตรวจ</span>
                <span class="badge bg-success">{{ stats.gradedSubmissions }} ตรวจแล้ว</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="row">
            <div class="col-lg-8">
              <div class="chart-card">
                <h3 class="chart-title">
                  <i class="bi bi-journal-album me-2"></i>
                  สถานะคอร์สเรียนทั้งหมด
                </h3>
                <div class="row h-100">
                  <!-- Published Column -->
                  <div class="col-md-6 border-end-md ps-md-4">
                    <div class="d-flex align-items-center mb-4 sticky-top bg-white pb-2" style="z-index: 10;">
                      <div class="icon-box published me-3">
                        <i class="bi bi-check-lg"></i>
                      </div>
                      <div>
                        <h5 class="mb-0 text-dark fw-bold">Published</h5>
                        <small class="text-muted">{{ publishedList.length }} รายการ</small>
                      </div>
                    </div>
                    
                    <div class="course-list-container custom-scrollbar">
                      <div v-if="publishedList.length === 0" class="text-center py-5">
                        <div class="icon-box published mx-auto mb-3" style="width: 48px; height: 48px; background: #ecfdf5;">
                           <i class="bi bi-inbox fs-4"></i>
                        </div>
                        <p class="m-0 text-muted small">ไม่พบคอร์สที่เผยแพร่</p>
                      </div>
                      <div v-else class="list-group list-group-flush pe-2">
                        <div v-for="course in publishedList" :key="course.course_id" 
                             class="course-item-card d-flex justify-content-between align-items-center p-3">
                          <div class="d-flex align-items-center text-truncate pe-3" style="flex: 1;">
                            <span class="text-truncate fw-medium text-dark" :title="course.course_name">{{ course.course_name }}</span>
                          </div>
                          <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">
                            v{{ course.active_published_version_id }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Draft Column -->
                  <div class="col-md-6 mt-4 mt-md-0 ps-md-4">
                    <div class="d-flex align-items-center mb-4 sticky-top bg-white pb-2" style="z-index: 10;">
                      <div class="icon-box draft me-3">
                         <i class="bi bi-pencil-fill"></i>
                      </div>
                      <div>
                        <h5 class="mb-0 text-dark fw-bold">Drafts</h5>
                         <small class="text-muted">{{ draftList.length }} รายการ</small>
                      </div>
                    </div>
                    
                    <div class="course-list-container custom-scrollbar">
                      <div v-if="draftList.length === 0" class="text-center py-5">
                         <div class="icon-box draft mx-auto mb-3" style="width: 48px; height: 48px;">
                           <i class="bi bi-journal fs-4"></i>
                        </div>
                         <p class="m-0 text-muted small">ไม่พบคอร์สแบบร่าง</p>
                      </div>
                      <div v-else class="list-group list-group-flush pe-2">
                        <div v-for="course in draftList" :key="course.course_id" 
                             class="course-item-card d-flex justify-content-between align-items-center p-3">
                          <div class="d-flex align-items-center text-truncate pe-3" style="flex: 1;">
                             <span class="text-truncate fw-medium text-dark" :title="course.course_name">{{ course.course_name }}</span>
                          </div>
                          <small class="text-muted font-monospace bg-light px-2 py-1 rounded">ID: {{ course.course_id }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="chart-card">
                <h3 class="chart-title">
                  <i class="bi bi-trophy-fill me-2"></i>
                  Top 5 คอร์สยอดนิยม
                </h3>
                <div class="top-courses-list">
                  <div v-for="(course, idx) in topCourses" :key="idx" class="top-course-item">
                    <span class="top-rank">{{ idx + 1 }}</span>
                    <span class="top-name">{{ course.name }}</span>
                    <span class="top-count">{{ course.enrollments }} คน</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tables Section -->
        <div class="tables-section">
          <div class="row">
            <!-- Latest Enrollments -->
            <div class="col-lg-6">
              <div class="table-card">
                <h3 class="table-title">
                  <i class="bi bi-clock-history me-2"></i>
                  การลงทะเบียนล่าสุด
                </h3>
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>ผู้เรียน</th>
                      <th>คอร์ส</th>
                      <th>วันที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(enroll, idx) in latestEnrollments" :key="idx">
                      <td>{{ enroll.user }}</td>
                      <td>{{ enroll.course }}</td>
                      <td class="text-muted">{{ enroll.date }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recent Submissions -->
            <div class="col-lg-6">
              <div class="table-card">
                <h3 class="table-title">
                  <i class="bi bi-file-earmark-arrow-up me-2"></i>
                  งานที่ส่งล่าสุด
                </h3>
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>ผู้เรียน</th>
                      <th>แบบฝึกหัด</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(sub, idx) in recentSubmissions" :key="idx">
                      <td>{{ sub.user }}</td>
                      <td>{{ sub.assignment }}</td>
                      <td>
                        <span :class="sub.status === 'graded' ? 'badge bg-success' : 'badge bg-warning text-dark'">
                          {{ sub.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ' }}
                        </span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDashboardStats } from '@/modules/reports/reports.api';
import { coursesApi, type CourseListItem } from '@/modules/courses/courses.api';

// Data
const loading = ref(true);

const stats = ref({
  totalUsers: 0,
  learners: 0,
  instructors: 0,
  admins: 0,
  totalCourses: 0,
  publishedCourses: 0,
  draftCourses: 0,
  totalEnrollments: 0,
  totalSubmissions: 0,
  pendingSubmissions: 0,
  gradedSubmissions: 0
});

const topCourses = ref<{ name: string; enrollments: number }[]>([]);
const latestEnrollments = ref<{ user: string; course: string; date: string }[]>([]);
const recentSubmissions = ref<{ user: string; assignment: string; status: string }[]>([]);

// Course Lists
const publishedList = ref<CourseListItem[]>([]);
const draftList = ref<CourseListItem[]>([]);

async function fetchData() {
  loading.value = true;
  
  try {
    const [statsData, coursesData] = await Promise.all([
      getDashboardStats(),
      coursesApi.getCourses()
    ]);
    
    // Map API response to local state
    stats.value = {
      totalUsers: statsData.userCount || 0,
      learners: statsData.learnerCount || 0,
      instructors: statsData.instructorCount || 0,
      admins: statsData.adminCount || 0,
      totalCourses: statsData.courseCount || 0,
      publishedCourses: statsData.publishedCourseCount || 0,
      draftCourses: statsData.draftCourseCount || 0,
      totalEnrollments: statsData.enrollmentCount || 0,
      totalSubmissions: (statsData.pendingAssignmentCount || 0) + (statsData.gradedSubmissionCount || 0),
      pendingSubmissions: statsData.pendingAssignmentCount || 0,
      gradedSubmissions: statsData.gradedSubmissionCount || 0
    };
    
    // Map top courses
    if (statsData.topCourses) {
      topCourses.value = statsData.topCourses.map((c: any) => ({
        name: c.course_name || 'Unknown',
        enrollments: parseInt(c.enrollment_count) || 0
      }));
    }
    
    // Map latest enrollments
    if (statsData.latestEnrollments) {
      latestEnrollments.value = statsData.latestEnrollments.map((e: any) => ({
        user: e.user ? `${e.user.first_name} ${e.user.last_name}` : 'Unknown',
        course: e.course?.course_name || 'Unknown',
        date: e.created_at ? new Date(e.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'
      }));
    }
    
    // Map recent submissions
    if (statsData.recentSubmissions) {
      recentSubmissions.value = statsData.recentSubmissions.map((s: any) => ({
        user: s.user ? `${s.user.first_name} ${s.user.last_name}` : 'Unknown',
        assignment: `Assignment #${s.assignment_id}`,
        status: s.status || 'pending'
      }));
    }

    // Filter courses
    publishedList.value = coursesData.filter(c => c.active_published_version_id);
    draftList.value = coursesData.filter(c => !c.active_published_version_id);
    
  } catch (e) {
    console.error('Failed to load report data', e);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.reports-page {
  min-height: 100vh;
  background-color: #f1f5f9;
}

/* Main content styles removed (global) */

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header - Green Theme */
.page-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 576px) {
  .stats-grid { grid-template-columns: 1fr; }
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid;
}

.stat-card.users { border-left-color: #10b981; }
.stat-card.courses { border-left-color: #059669; }
.stat-card.enrollments { border-left-color: #34d399; }
.stat-card.submissions { border-left-color: #6ee7b7; }

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card.users .stat-icon { background: #ecfdf5; color: #059669; }
.stat-card.courses .stat-icon { background: #d1fae5; color: #047857; }
.stat-card.enrollments .stat-icon { background: #a7f3d0; color: #065f46; }
.stat-card.submissions .stat-icon { background: #6ee7b7; color: #064e3b; }

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  margin: 6px 0;
}

.stat-detail {
  font-size: 0.8rem;
}

/* Chart Section */
.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  height: 100%;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.chart-title i {
  color: #10b981;
}

/* Course List for Reports */
.course-list-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 12px 8px 4px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  border: 2px solid #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px dashed #e2e8f0;
  }
}

.font-size-1rem {
  font-size: 1rem;
}

.course-item-card {
  transition: all 0.2s ease;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.course-item-card:hover {
  background-color: #f8fafc;
  transform: translateX(4px);
  border-color: #f1f5f9;
}

.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-box.published {
  background-color: #d1fae5;
  color: #059669;
}

.icon-box.draft {
  background-color: #f1f5f9;
  color: #64748b;
}

/* Top Courses */
.top-courses-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-course-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 10px;
}

.top-rank {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-name {
  flex: 1;
  font-weight: 500;
  color: #1e293b;
}

.top-count {
  font-size: 0.85rem;
  color: #059669;
  font-weight: 600;
}

/* Tables Section */
.table-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.table-title i {
  color: #10b981;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.table td {
  vertical-align: middle;
  font-size: 0.9rem;
}
</style>
