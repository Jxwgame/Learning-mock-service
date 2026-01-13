<template>
  <div class="courses-management">
    <div class="content-wrapper">
      <div class="content-wrapper">
        <div class="page-header-modern mb-4">
          <div class="header-content d-flex align-items-center justify-content-between">
            <div class="header-text">
              <h1 class="page-title-modern">
                <i class="fas fa-tasks me-2"></i>การจัดการคอร์สเรียน
              </h1>
              <p class="page-subtitle-modern">ภาพรวมและแดชบอร์ดสำหรับการบริหารจัดการคอร์สของคุณ</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-header-primary" @click="handleCreate">
                <i class="fas fa-plus me-2"></i>สร้างคอร์สใหม่
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="row g-4 mb-4">
          <div v-for="stat in stats" :key="stat.label" class="col-md-6 col-lg-3">
            <div class="stat-card-modern">
              <div class="stat-icon-bg" :class="stat.type">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-data">
                <span class="stat-label-mini">{{ stat.label }}</span>
                <h3 class="stat-value-large">{{ stat.value }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Courses Table/List -->
        <div class="content-card-modern">
          <div class="card-header-modern">
            <h5 class="fw-bold mb-0">คอร์สที่กำลังดำเนินการ</h5>
            <button class="btn btn-link-emerald" @click="$router.push('/courses')">ดูทั้งหมด</button>
          </div>
          
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="hasError" class="error-state">
            <i class="fas fa-exclamation-circle fa-2x text-danger"></i>
            <p>{{ errorMessage }}</p>
            <button class="btn btn-outline-modern" @click="courseStore.fetchManagedCourses()">ลองอีกครั้ง</button>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="managementCourses.length === 0" class="empty-state">
            <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
            <h5>ยังไม่มีคอร์ส</h5>
            <p class="text-muted">เริ่มต้นสร้างคอร์สแรกของคุณ</p>
            <button class="btn btn-header-primary" @click="handleCreate">
              <i class="fas fa-plus me-2"></i>สร้างคอร์สใหม่
            </button>
          </div>
          
          <!-- Data Table -->
          <div v-else class="table-responsive">
            <table class="table table-hover-modern">
              <thead>
                <tr>
                  <th>ชื่อคอร์ส / ปี</th>
                  <th>สถานะ</th>
                  <th>เวอร์ชันล่าสุด</th>
                  <th>ผู้ลงทะเบียน</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in managementCourses" :key="course.course_id">
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <div class="course-mini-icon">{{ course.icon }}</div>
                      <div class="d-flex flex-column">
                        <span class="fw-bold">{{ course.course_name }}</span>
                        <span class="text-muted small">รุ่นปี {{ course.year }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge-status-modern" :class="course.status">
                      {{ course.statusText }}
                    </span>
                  </td>
                  <td>v{{ course.version }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-1">
                      <i class="fas fa-users text-primary small"></i>
                      <span>{{ course.enrollment_count || 0 }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons-mini">
                      <button class="btn-action-icon" title="แก้ไข" @click="handleEdit(course.course_id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-action-icon" title="เวอร์ชัน" @click="handleVersions(course.course_id)">
                        <i class="fas fa-history"></i>
                      </button>
                      <button class="btn-action-icon danger" title="ลบ" @click="handleDelete(course.course_id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../courses.store';
import { showDeleteConfirm, showSuccess, showError } from '@/core/utils/swal';

const router = useRouter();
const courseStore = useCourseStore();

// Layout state removed (global)

const handleCreate = () => {
    router.push('/courses/create');
};

// Fetch data on mount
onMounted(() => {
    courseStore.fetchManagedCourses();
});

// Computed data from store
const managementCourses = computed(() => {
    const courses = courseStore.managedCourses || [];
    return courses.map(course => ({
        ...course,
        icon: getCourseIcon(course.course_name || ''),
        status: course.active_published_version_id ? 'published' : 'draft',
        statusText: course.active_published_version_id ? 'เผยแพร่แล้ว' : 'ฉบับร่าง',
        version: course.active_published_version_id ? `Active: #${course.active_published_version_id}` : `Draft: v${course.version_count || 1}`,
        rating: 4.5,
    }));
});

const isLoading = computed(() => courseStore.loading);
const hasError = computed(() => courseStore.hasError);
const errorMessage = computed(() => courseStore.error);

// Helper function to get icon based on course name
function getCourseIcon(name: string): string {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('เว็บ') || lowerName.includes('web')) return '💻';
    if (lowerName.includes('python')) return '🐍';
    if (lowerName.includes('design') || lowerName.includes('ออกแบบ')) return '🎨';
    if (lowerName.includes('พยาบาล') || lowerName.includes('สุขภาพ') || lowerName.includes('health')) return '🏥';
    if (lowerName.includes('data') || lowerName.includes('ข้อมูล')) return '📊';
    return '📚';
}

// Dynamic stats based on actual data
const stats = computed(() => {
    const courses = courseStore.managedCourses || [];
    return [
        { label: 'คอร์สทั้งหมด', value: String(courses.length), icon: 'fas fa-book', type: 'primary' },
        { label: 'ผู้เรียนสะสม', value: calculateTotalEnrollments(), icon: 'fas fa-users', type: 'success' },
        { label: 'คะแนนเฉลี่ย', value: '4.8', icon: 'fas fa-star', type: 'warning' },
        { label: 'เผยแพร่แล้ว', value: countPublished(), icon: 'fas fa-check-circle', type: 'info' },
    ];
});

function calculateTotalEnrollments(): string {
    const courses = courseStore.managedCourses || [];
    const total = courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0);
    if (total >= 1000) return `${(total / 1000).toFixed(1)}K`;
    return String(total);
}

function countPublished(): string {
    const courses = courseStore.managedCourses || [];
    return String(courses.filter(c => c.active_published_version_id).length);
}

// Actions
const handleEdit = (courseId: number) => {
    router.push(`/courses/edit/${courseId}`);
};

const handleVersions = (courseId: number) => {
    router.push(`/courses/instructor/${courseId}`);
};

const handleDelete = async (courseId: number) => {
    const result = await showDeleteConfirm('คอร์สนี้', 'ยืนยันการลบคอร์ส');
    if (result.isConfirmed) {
        try {
            await courseStore.deleteCourse(courseId);
            showSuccess('ลบคอร์สสำเร็จ');
        } catch (err) {
            console.error('Failed to delete course:', err);
            showError('ลบคอร์สไม่สำเร็จ');
        }
    }
};
</script>

<style scoped>
.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header - Green Gradient */
.page-header-modern {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

.page-title-modern {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
}

.page-subtitle-modern {
  opacity: 0.9;
  margin: 0;
  color: white;
}

.btn-header-primary {
  background: white;
  color: #059669;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-header-primary:hover {
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.stat-card-modern {
  background: white;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.stat-icon-bg {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.stat-icon-bg.primary { background: #eff6ff; color: #3b82f6; }
.stat-icon-bg.success { background: #f0fdf4; color: #10b981; }
.stat-icon-bg.warning { background: #fffbeb; color: #f59e0b; }
.stat-icon-bg.info { background: #fdf2f8; color: #ec4899; }

.stat-label-mini {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-value-large {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0;
}

.content-card-modern {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.card-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.btn-link-emerald {
  color: #10b981;
  font-weight: 600;
  text-decoration: none;
  background: transparent;
  border: none;
}

.course-mini-icon {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.2rem;
}

.badge-status-modern {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-status-modern.published { background: #f0fdf4; color: #10b981; }
.badge-status-modern.draft { background: #f1f5f9; color: #64748b; }

.action-buttons-mini {
  display: flex;
  gap: 8px;
}

.btn-action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action-icon:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-action-icon.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* State Styles */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
}

.loading-state i,
.error-state i {
  margin-bottom: 16px;
  color: #94a3b8;
}

.error-state i {
  color: #ef4444;
}

.loading-state p,
.error-state p {
  margin-bottom: 16px;
}

.btn-outline-modern {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-modern:hover {
  border-color: #10b981;
  color: #10b981;
}

.btn-header-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-header-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}
</style>
