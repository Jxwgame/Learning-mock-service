<template>
  <div class="courses-list-page">
    <div class="content-wrapper">
      <div class="content-wrapper">
        <div class="page-header-modern mb-4">
          <div class="header-content d-flex align-items-center justify-content-between">
            <div class="header-text">
              <h1 class="page-title-modern">
                <i class="fas fa-book me-2"></i>รายการคอร์สเรียน
              </h1>
              <p class="page-subtitle-modern">เลือกดูคอร์สที่คุณสนใจและเริ่มต้นเรียนรู้ได้ทันที</p>
            </div>
             <button v-if="canCreateCourse" @click="router.push('/courses/create')" class="btn btn-primary d-flex align-items-center gap-2 rounded-3 px-4 shadow-sm">
                <i class="fas fa-plus"></i> <span class="d-none d-sm-inline">สร้างคอร์สใหม่</span>
             </button>
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
        <div v-else-if="filteredCourses.length === 0" class="text-center py-5">
             <div class="bg-light rounded-circle d-inline-flex p-4 mb-3">
                 <i class="fas fa-inbox fa-3x text-muted opacity-50"></i>
             </div>
             <p class="text-muted">ยังไม่มีคอร์สในขณะนี้</p>
        </div>

        <div v-else class="row g-4 mt-2">
          <div v-for="course in filteredCourses" :key="course.course_id" class="col-md-6 col-lg-4">
            <div class="course-card-modern" @click="navigateToDetail(course.course_id)">
              <div class="course-badge-modern" v-if="isNew(course.created_at)">New</div>
              
              <div class="course-image-modern">
                <img v-if="course.cover_image_url" :src="getImageUrl(course.cover_image_url)" alt="Course Cover" class="course-cover-img">
                <span v-else class="course-icon-large">📚</span>
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
                  <div class="course-meta-item">
                     <i class="fas fa-user-tie text-secondary"></i>
                     <span class="text-truncate" style="max-width: 120px;">
                        {{ course.instructor_name || 'ไม่ระบุผู้สอน' }}
                     </span>
                  </div>
                  
                  <!-- Enroll Action -->
                  <div class="course-action">
                    <button 
                        v-if="isEnrolled(course.course_id)" 
                        class="btn btn-sm btn-soft-success"
                        disabled
                    >
                        <i class="fas fa-check-circle me-1"></i> ลงทะเบียนแล้ว
                    </button>
                    <button 
                        v-else 
                        class="btn btn-sm btn-emerald-outline"
                        @click.stop="handleEnroll(course.course_id)"
                        :disabled="enrollingId === course.course_id"
                    >
                        <span v-if="enrollingId === course.course_id">
                            <span class="spinner-border spinner-border-sm me-1"></span>
                        </span>
                        <span v-else>
                            <i class="fas fa-plus-circle me-1"></i> ลงทะเบียน
                        </span>
                    </button>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { coursesApi, type CourseListItem } from '../courses.api';
import { usePermissions } from '../../../core/permissions/permissions';
import { useEnrollmentsStore } from '../../enrollments/enrollments.store';
import { showSuccess, showError, showConfirm } from '@/core/utils/swal';
import { getImageUrl } from '../../../core/utils/image.helper';

const router = useRouter();
const { hasAnyRole } = usePermissions();

// Layout state removed (global)

const courses = ref<CourseListItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const enrollingId = ref<number | null>(null);

const enrollmentsStore = useEnrollmentsStore();

// Filtered courses
const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value;
  const query = searchQuery.value.toLowerCase();
  return courses.value.filter(c => 
    c.course_name.toLowerCase().includes(query) || 
    (c.description && c.description.toLowerCase().includes(query))
  );
});

const canCreateCourse = computed(() => hasAnyRole('admin', 'instructor'));

const navigateToDetail = (id: number) => {
    router.push(`/courses/detail/${id}`);
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
        const data = await coursesApi.getCourses();
        courses.value = data;
        
        // Also fetch enrollments to check status
        await enrollmentsStore.fetchMyCourses();
    } catch (err: any) {
        console.error(err);
        error.value = err.message || 'ไม่สามารถโหลดข้อมูลคอร์สได้';
    } finally {
        loading.value = false;
    }
}

function isEnrolled(courseId: number) {
    return enrollmentsStore.isEnrolled(courseId);
}

async function handleEnroll(courseId: number) {
    const confirm = await showConfirm(
        'ยืนยันการลงทะเบียน?',
        'คุณต้องการลงทะเบียนเรียนในคอร์สนี้ใช่หรือไม่',
        'ใช่, ลงทะเบียน',
        'ยกเลิก'
    );

    if (!confirm.isConfirmed) return;

    enrollingId.value = courseId;
    try {
        await enrollmentsStore.enroll(courseId);
        
        await showSuccess('ลงทะเบียนสำเร็จ!');
        
        // Refresh to update counts if needed
        await fetchCourses(); 
    } catch (e: any) {
        showError('เกิดข้อผิดพลาด', e.message || 'ไม่สามารถลงทะเบียนได้');
    } finally {
        enrollingId.value = null;
    }
}

onMounted(() => {
    fetchCourses();
});
</script>

<style scoped>
.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
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

.course-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 500;
}

/* Page Header Modern */
.page-header-modern {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
}

.page-title-modern {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
}

.page-subtitle-modern {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-size: 1.05rem;
}

/* Custom Green Button for Create */
.btn-primary {
    background: white;
    color: #059669; /* Emerald 600 */
    border: none;
    font-weight: 600;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    background: #ecfdf5; /* Emerald 50 */
    color: #047857; /* Emerald 700 */
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-price-modern {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--primary-emerald, #10b981);
}

/* Search Box */
.search-box-modern {
    position: relative;
    max-width: 400px;
}

.search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.8);
}

.form-control-search {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 10px 15px 10px 45px;
    color: white;
    width: 100%;
    transition: all 0.2s ease;
}

.form-control-search::placeholder {
    color: rgba(255, 255, 255, 0.7);
}

.form-control-search:focus {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    outline: none;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

/* Enrollment Buttons */
.btn-emerald-outline {
    color: #059669;
    border: 1px solid #059669;
    background: transparent;
    transition: all 0.2s ease;
    font-weight: 600;
}

.btn-emerald-outline:hover {
    background: #059669;
    color: white;
    box-shadow: 0 4px 10px rgba(5, 150, 105, 0.2);
}

.btn-soft-success {
    background: #ecfdf5;
    color: #059669;
    border: none;
    font-weight: 600;
}

</style>