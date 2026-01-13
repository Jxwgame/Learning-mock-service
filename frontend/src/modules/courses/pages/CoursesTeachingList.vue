<template>
  <div class="courses-teaching-list">
    <div class="content-wrapper">
      <div class="content-wrapper">
        <div class="page-header-modern mb-4">
          <div class="header-content d-flex align-items-center justify-content-between">
            <div class="header-text">
              <h1 class="page-title-modern">
                <i class="fas fa-chalkboard-teacher me-2"></i>คอร์สที่ฉันสอน
              </h1>
              <p class="page-subtitle-modern">จัดการเนื้อหาและติดตามความคืบหน้าของคอร์สที่คุณรับผิดชอบ</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
           <div class="spinner-border text-primary" role="status"></div>
           <p class="mt-2 text-muted">กำลังโหลดข้อมูลคอร์ส...</p>
        </div>

         <!-- Error State -->
        <div v-else-if="error" class="text-center py-5">
           <div class="text-danger mb-3"><i class="fas fa-exclamation-circle fa-2x"></i></div>
           <p class="text-muted">{{ error }}</p>
           <button class="btn btn-outline-primary btn-sm mt-2" @click="fetchCourses">ลองใหม่</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="courses.length === 0" class="text-center py-5">
             <div class="bg-light rounded-circle d-inline-flex p-4 mb-3">
                 <i class="fas fa-chalkboard fa-3x text-muted opacity-50"></i>
             </div>
             <p class="text-muted">คุณยังไม่มีคอร์สที่ได้รับมอบหมายให้สอน</p>
        </div>

        <div v-else class="row g-4 mt-2">
          <div v-for="course in courses" :key="course.course_id" class="col-md-6 col-lg-4">
            <div class="course-card-modern" @click="navigateToDetail(course.course_id)">
              <div class="course-badge-modern" v-if="isNew(course.created_at)">New</div>
              
              <div class="course-image-modern">
                <img v-if="course.cover_image_url" :src="course.cover_image_url" alt="Course Cover" class="course-cover-img">
                <span v-else class="course-icon-large">👨‍🏫</span>
              </div>
              
              <div class="course-body-modern">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h3 class="course-title-modern mb-0 text-truncate" :title="course.course_name">{{ course.course_name }}</h3>
                    <span class="badge-year" v-if="course.year">รุ่นปี {{ course.year }}</span>
                </div>
                
                <p class="course-desc-modern">
                    {{ course.description || 'ไม่มีคำอธิบายเพิ่มเติม' }}
                </p>
                
                <div class="course-footer-modern">
                  <button class="btn btn-sm btn-outline-primary w-100 rounded-pill">
                    <i class="fas fa-edit me-1"></i> จัดการคอร์ส
                  </button>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Layout components removed (global)
import { courseInstructorsApi } from '../courseInstructors.api';

const router = useRouter();

// Layout state removed (global)

const courses = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const navigateToDetail = (id: number) => {
    // Navigate to Instructor Course Detail page
    router.push(`/courses/instructor/${id}`);
};

const isNew = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // New within 7 days
};

async function fetchCourses() {
    loading.value = true;
    error.value = null;
    try {
        const data = await courseInstructorsApi.getMyTeachingCourses();
        // Backend returns { course: { ... }, role, ... }, we need to flatten it for the template
        courses.value = data.map((item: any) => ({
            ...item.course,
            role: item.role, // Preserve role info if needed
            assigned_at: item.assigned_at
        }));
    } catch (err: any) {
        console.error(err);
        error.value = err.message || 'ไม่สามารถโหลดข้อมูลคอร์สได้';
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchCourses();
});
</script>

<style scoped>
/* Reuse styles from CoursesList.vue */
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

.course-card-modern {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    height: 100%;
    cursor: pointer;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
}

.course-card-modern:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.2);
}

.course-badge-modern {
    position: absolute;
    top: 15px;
    right: 15px;
    background: var(--primary-emerald, #10b981);
    color: white;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 2;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.badge-year {
    background: #f1f5f9;
    color: #64748b;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
}

.course-image-modern {
    height: 180px;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.course-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.course-card-modern:hover .course-cover-img {
    transform: scale(1.05);
}

.course-icon-large {
    font-size: 4rem;
}

.course-body-modern {
    padding: 25px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.course-title-modern {
    font-size: 1.15rem;
    font-weight: 800;
    color: #1e293b;
    line-height: 1.4;
    margin-right: 8px;
}

.course-desc-modern {
    color: #64748b;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex-grow: 1;
}

.course-footer-modern {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f1f5f9;
    margin-top: auto;
}
</style>
