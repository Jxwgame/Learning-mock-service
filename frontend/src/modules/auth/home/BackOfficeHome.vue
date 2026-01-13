<template>
  <div class="backoffice-layout">
    <!-- Navigation Components -->
  <div class="backoffice-layout">
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Page Header with Gradient -->
      <div class="page-header-modern">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title-modern">ภาพรวมระบบ</h1>
            <p class="page-subtitle-modern">ยินดีต้อนรับ, {{ user?.firstName || 'ผู้ใช้งาน' }} 👋 สู่ระบบจัดการการเรียนการสอน</p>
          </div>
        </div>
      </div>
      <div class="header-actions d-flex justify-content-end mb-3">
        <button class="btn btn-outline-success">
          <i class="bi bi-plus-lg me-2"></i>
          สร้างคอร์สใหม่
        </button>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid">
        <div class="stat-card-modern cyan">
          <div class="stat-card-header">
            <div class="stat-icon-modern cyan">
              <i class="bi bi-collection"></i>
            </div>
          </div>
          <div class="stat-value">{{ loading ? '...' : stats.courseCount }}</div>
          <div class="stat-label-modern">คอร์สทั้งหมด</div>
          <div class="stat-progress">
            <div class="progress-bar cyan" style="width: 75%"></div>
          </div>
        </div>

        <div class="stat-card-modern green">
          <div class="stat-card-header">
            <div class="stat-icon-modern green">
              <i class="bi bi-people"></i>
            </div>
          </div>
          <div class="stat-value">{{ loading ? '...' : stats.enrollmentCount.toLocaleString() }}</div>
          <div class="stat-label-modern">ยอดลงทะเบียน</div>
          <div class="stat-progress">
            <div class="progress-bar green" style="width: 85%"></div>
          </div>
        </div>

        <div class="stat-card-modern blue">
          <div class="stat-card-header">
            <div class="stat-icon-modern blue">
              <i class="bi bi-clipboard-check"></i>
            </div>
          </div>
          <div class="stat-value">{{ loading ? '...' : stats.pendingAssignmentCount }}</div>
          <div class="stat-label-modern">การบ้านที่รอตรวจ</div>
          <div class="stat-progress">
            <div class="progress-bar blue" style="width: 60%"></div>
          </div>
        </div>

        <div class="stat-card-modern amber">
          <div class="stat-card-header">
            <div class="stat-icon-modern amber">
              <i class="bi bi-person-video3"></i>
            </div>
          </div>
          <div class="stat-value">{{ loading ? '...' : stats.instructorCount }}</div>
          <div class="stat-label-modern">ผู้สอน</div>
          <div class="stat-progress">
            <div class="progress-bar amber" style="width: 90%"></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-modern">
        <div class="section-header-modern">
          <div class="section-title-modern">
            <span class="section-icon-modern">
              <i class="bi bi-lightning-charge-fill"></i>
            </span>
            <h2>การดำเนินการด่วน</h2>
          </div>
        </div>
        <div class="action-grid">
          <a href="#" class="action-card">
            <div class="action-icon cyan">
              <i class="bi bi-plus-circle-fill"></i>
            </div>
            <span class="action-label">สร้างคอร์สใหม่</span>
            <i class="bi bi-chevron-right action-arrow"></i>
          </a>
          <a href="#" class="action-card">
            <div class="action-icon green">
              <i class="bi bi-journal-plus"></i>
            </div>
            <span class="action-label">เพิ่มบทเรียน</span>
            <i class="bi bi-chevron-right action-arrow"></i>
          </a>
          <a href="#" class="action-card">
            <div class="action-icon blue">
              <i class="bi bi-clipboard-plus"></i>
            </div>
            <span class="action-label">สร้างการบ้าน</span>
            <i class="bi bi-chevron-right action-arrow"></i>
          </a>
          <a href="#" class="action-card">
            <div class="action-icon amber">
              <i class="bi bi-people-fill"></i>
            </div>
            <span class="action-label">เพิ่มผู้สอน</span>
            <i class="bi bi-chevron-right action-arrow"></i>
          </a>
        </div>
      </div>

      <div class="content-grid">
        <!-- Course List -->
        <div class="course-section-modern">
          <div class="table-header-modern">
            <div class="section-title-modern">
              <span class="section-icon-modern green">
                <i class="bi bi-collection-fill"></i>
              </span>
              <h2>คอร์สล่าสุด</h2>
            </div>
            <div class="table-actions">
              <div class="search-box-modern">
                <i class="bi bi-search"></i>
                <input type="text" v-model="searchQuery" placeholder="ค้นหาคอร์ส..." />
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredCourses.length === 0" class="text-center py-5">
            <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
            <p class="mt-2 text-muted">ไม่พบคอร์ส</p>
          </div>

          <!-- Courses Table -->
          <div v-else class="table-wrapper">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>ชื่อคอร์ส</th>
                  <th>ปี</th>
                  <th>ผู้เรียน</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in filteredCourses.slice(0, 5)" :key="course.course_id">
                  <td>
                    <div class="course-info">
                      <div class="course-icon-modern" :class="{ 'p-0 overflow-hidden': course.cover_image_url, 'cyan': !course.cover_image_url }">
                        <img v-if="course.cover_image_url" :src="getImageUrl(course.cover_image_url)" alt="Cover" class="w-100 h-100 object-fit-cover" />
                        <i v-else class="bi bi-journal-bookmark"></i>
                      </div>
                      <div class="course-details">
                        <span class="course-name-modern">{{ course.course_name }}</span>
                        <span class="course-category">{{ course.description?.substring(0, 30) || 'ไม่มีคำอธิบาย' }}...</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ course.year || '-' }}</span>
                  </td>
                  <td>
                    <div class="student-count">
                      <i class="bi bi-people"></i>
                      {{ course.enrollment_count || 0 }} คน
                    </div>
                  </td>
                  <td>
                    <span class="badge-modern" :class="course.active_published_version_id ? 'published' : 'draft'">
                      {{ course.active_published_version_id ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons-modern">
                      <router-link :to="`/courses/detail/${course.course_id}`" class="btn-icon" title="ดูรายละเอียด">
                        <i class="bi bi-eye"></i>
                      </router-link>
                      <button class="btn-icon" title="แก้ไข">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="activity-feed-modern">
          <div class="section-title-modern mb-4">
            <span class="section-icon-modern amber">
              <i class="bi bi-activity"></i>
            </span>
            <h2>กิจกรรมล่าสุด</h2>
          </div>
          
          <div class="activity-list">
            <div v-if="loading" class="text-center py-4 text-muted">กำลังโหลดกิจกรรม...</div>
            <div v-else-if="stats.recentActivities.length === 0" class="text-center py-4 text-muted">ไม่มีกิจกรรมล่าสุด</div>
            
            <div 
              v-else
              v-for="activity in stats.recentActivities" 
              :key="activity.log_id" 
              class="activity-item-modern"
            >
              <div class="activity-icon-modern cyan">
                <i class="bi bi-clock-history"></i>
              </div>
              <div class="activity-content-modern">
                <div class="activity-title-modern">
                  <span class="fw-bold">{{ getUserName(activity.user) }}</span> 
                  {{ formatAction(activity.action) }}
                </div>
                <div class="activity-time-modern">
                  <i class="bi bi-clock"></i>
                  {{ formatTimeAgo(activity.created_at) }}
                </div>
              </div>
            </div>
          </div>
          
          <a href="#" class="view-all-activities">
            ดูกิจกรรมทั้งหมด
            <i class="bi bi-arrow-right ms-2"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '../auth.store';
import type { Course } from '../../courses/courses.api';
import { getCourses } from '../../courses/courses.api';
import { getImageUrl } from '@/core/utils/image.helper';

// Utilities

const authStore = useAuthStore();
// const courseStore = useCourseStore(); // Not directly used here yet

const user = computed(() => authStore.user);

// Data
const loading = ref(true);
interface DashboardStats {
  courseCount: number;
  enrollmentCount: number;
  instructorCount: number;
  pendingAssignmentCount: number;
  recentActivities: any[];
}
const stats = ref<DashboardStats>({
  courseCount: 0,
  enrollmentCount: 0,
  instructorCount: 0,
  pendingAssignmentCount: 0,
  recentActivities: []
});
const searchQuery = ref('');
const courses = ref<Course[]>([]);

// Computed
const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value;
  return courses.value.filter(c => 
    c.course_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Mock Stats Service (Replace with real API later)
async function getDashboardStats(): Promise<DashboardStats> {
    return {
      courseCount: courses.value.length,
      enrollmentCount: 125, // Mock
      instructorCount: 8, // Mock
      pendingAssignmentCount: 12, // Mock
      recentActivities: [
        { log_id: 1, user: { firstName: 'System', lastName: 'Admin' }, action: 'LOGIN', created_at: new Date().toISOString() },
        { log_id: 2, user: { firstName: 'Test', lastName: 'Common' }, action: 'ENROLL_COURSE', created_at: new Date(Date.now() - 3600000).toISOString() },
      ]
    };
}

// Helpers
const getUserName = (u: any) => u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Unknown';
const formatAction = (action: string) => {
  const map: Record<string, string> = {
    'CREATE_COURSE': 'สร้างคอร์สใหม่',
    'UPDATE_COURSE': 'แก้ไขคอร์ส',
    'DELETE_COURSE': 'ลบคอร์ส',
    'ENROLL_COURSE': 'ลงทะเบียนเรียน',
    'SUBMIT_ASSIGNMENT': 'ส่งงาน',
    'LOGIN': 'เข้าสู่ระบบ'
  };
  return map[action] || action;
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${days} วันที่แล้ว`;
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  try {
    courses.value = await getCourses();
    stats.value = await getDashboardStats();
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
:root {
  --sidebar-width: 280px;
  --navbar-height: 72px;
  --primary: #059669;
  --primary-light: #10b981;
  --cyan: #0891b2;
  --blue: #3b82f6;
  --amber: #f59e0b;
}

.backoffice-layout {
  min-height: 100vh;
  background: #ffffff;
}

/* Main content styles removed (global) */

/* Page Header - Green Gradient */
.page-header-modern {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

/* Element removed */

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.page-title-modern {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
}

.page-subtitle-modern {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-header-action {
  padding: 10px 18px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-header-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.btn-header-primary {
  padding: 10px 20px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.2);
}

.btn-header-primary:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(5, 150, 105, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card-modern {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card-modern.cyan::before { background: linear-gradient(90deg, #0891b2, #06b6d4); }
.stat-card-modern.green::before { background: linear-gradient(90deg, #059669, #10b981); }
.stat-card-modern.blue::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.stat-card-modern.amber::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-icon-modern {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.stat-icon-modern.cyan { background: #ecfeff; color: #0891b2; }
.stat-icon-modern.green { background: #ecfdf5; color: #059669; }
.stat-icon-modern.blue { background: #eff6ff; color: #3b82f6; }
.stat-icon-modern.amber { background: #fffbeb; color: #f59e0b; }

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-trend.positive {
  background: #ecfdf5;
  color: #059669;
}

.stat-trend.warning {
  background: #fffbeb;
  color: #f59e0b;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label-modern {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.stat-progress {
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 1s ease;
}

.progress-bar.cyan { background: linear-gradient(90deg, #0891b2, #06b6d4); }
.progress-bar.green { background: linear-gradient(90deg, #059669, #10b981); }
.progress-bar.blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.progress-bar.amber { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

/* Quick Actions */
.quick-actions-modern {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 30px;
}

.section-header-modern {
  margin-bottom: 24px;
}

.section-title-modern {
  display: flex;
  align-items: center;
  gap: 14px;
}

.section-title-modern h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-icon-modern {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #f59e0b;
}

.section-icon-modern.green {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}

.section-icon-modern.amber {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #f59e0b;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover {
  background: white;
  border-color: #059669;
  box-shadow: 0 8px 30px rgba(5, 150, 105, 0.12);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.action-icon.cyan { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; }
.action-icon.green { background: linear-gradient(135deg, #059669, #10b981); color: white; }
.action-icon.blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; }
.action-icon.amber { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; }

.action-label {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.action-arrow {
  color: #94a3b8;
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  color: #059669;
  transform: translateX(4px);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Course Section */
.course-section-modern {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.table-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.search-box-modern {
  position: relative;
  width: 280px;
}

.search-box-modern input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.search-box-modern input:focus {
  outline: none;
  border-color: #059669;
  background: white;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.search-box-modern i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.btn-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  color: #64748b;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-filter:hover {
  border-color: #059669;
  color: #059669;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.table-modern {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.table-modern thead th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #f1f5f9;
}

.table-modern tbody tr {
  background: #f8fafc;
  transition: all 0.3s ease;
}

.table-modern tbody tr:hover {
  background: #f0fdf4;
  transform: scale(1.01);
}

.table-modern tbody td {
  padding: 16px;
}

.table-modern tbody td:first-child {
  border-radius: 12px 0 0 12px;
}

.table-modern tbody td:last-child {
  border-radius: 0 12px 12px 0;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.course-icon-modern {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.course-icon-modern.cyan { background: linear-gradient(135deg, #0891b2, #06b6d4); }
.course-icon-modern.green { background: linear-gradient(135deg, #059669, #10b981); }
.course-icon-modern.blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }

.course-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.course-name-modern {
  font-weight: 600;
  color: #1e293b;
}

.course-category {
  font-size: 0.8rem;
  color: #94a3b8;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instructor-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.instructor-avatar.pink { background: linear-gradient(135deg, #ec4899, #f472b6); }
.instructor-avatar.blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }

.student-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.9rem;
}

.student-count i {
  color: #059669;
}

.badge-modern {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-modern.published {
  background: #ecfdf5;
  color: #059669;
}

.badge-modern.draft {
  background: #fffbeb;
  color: #f59e0b;
}

.action-buttons-modern {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  border-color: #059669;
  color: #059669;
  background: #f0fdf4;
}

/* Activity Feed */
.activity-feed-modern {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-item-modern {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item-modern:hover {
  background: #f8fafc;
}

.activity-icon-modern {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.activity-icon-modern.cyan { background: #ecfeff; color: #0891b2; }
.activity-icon-modern.green { background: #ecfdf5; color: #059669; }
.activity-icon-modern.blue { background: #eff6ff; color: #3b82f6; }
.activity-icon-modern.amber { background: #fffbeb; color: #f59e0b; }

.activity-content-modern {
  flex: 1;
}

.activity-title-modern {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.activity-time-modern {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.view-all-activities {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  margin-top: 16px;
  background: #f8fafc;
  border-radius: 12px;
  color: #059669;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.view-all-activities:hover {
  background: #f0fdf4;
  color: #047857;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .table-header-modern {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box-modern {
    width: 100%;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
