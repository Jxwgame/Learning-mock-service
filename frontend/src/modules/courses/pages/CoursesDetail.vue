<template>
  <div class="courses-detail-page">
    <div class="content-wrapper">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-emerald" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">กำลังโหลด...</span>
            </div>
            <p class="mt-3 text-muted">กำลังโหลดข้อมูลคอร์ส...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="fas fa-exclamation-triangle me-3"></i>
            <div>
              <strong>เกิดข้อผิดพลาด:</strong> {{ error }}
            </div>
          </div>
          <button class="btn btn-outline-emerald" @click="fetchCourseData">
            <i class="fas fa-refresh me-2"></i>ลองใหม่
          </button>
        </div>

        <!-- Course Content -->
        <template v-else>
          <div class="page-header-modern mb-4">
            <div class="header-content d-flex align-items-center justify-content-between">
              <div class="header-text">
                  <button class="btn btn-outline-emerald btn-sm mb-3" @click="handleBack">
                      <i class="fas fa-chevron-left me-2"></i>กลับไปหน้ารายการคอร์ส
                  </button>
                  <div class="d-flex align-items-center gap-3">
                      <h1 class="page-title-modern mb-0">
                          {{ courseName }}
                      </h1>
                      <span class="badge-year">รุ่นปี {{ courseYear }}</span>
                  </div>
              </div>
              <div class="header-actions">
                  <button 
                    v-if="isEnrolled" 
                    class="btn btn-header-success"
                    @click="router.push(`/learning/${course?.course_id}`)"
                  >
                      <i class="fas fa-play-circle me-2"></i>เข้าเรียน
                  </button>
                  <button 
                    v-else 
                    class="btn btn-header-primary"
                    @click="handleEnroll"
                    :disabled="isEnrolling"
                  >
                      <span v-if="isEnrolling">
                        <span class="spinner-border spinner-border-sm me-2"></span>กำลังลงทะเบียน...
                      </span>
                      <span v-else>
                        <i class="fas fa-user-plus me-2"></i>ลงทะเบียนเรียน
                      </span>
                  </button>
              </div>
            </div>
          </div>

          <div class="row g-4 mt-2">
              <!-- Main Content -->
              <div class="col-lg-8">
                  <div class="detail-card-modern">
                      <h2 class="section-title-modern">รายละเอียดคอร์ส</h2>
                      <div class="description-content">
                          <p>{{ courseDescription }}</p>
                      </div>

                      <!-- Cover Image if available -->
                      <div v-if="course?.cover_image_url" class="course-cover-image mt-4">
                          <img :src="getImageUrl(course.cover_image_url)" :alt="courseName" class="img-fluid rounded" />
                      </div>

                      <!-- Published Lessons (Curriculum) -->
                      <template v-if="hasPublishedContent">
                          <h2 class="section-title-modern mt-5">เนื้อหาคอร์ส</h2>
                          <div v-if="lessons.length > 0" class="curriculum-list">
                              <div v-for="(lesson, idx) in lessons" :key="lesson.lesson_id" class="curriculum-item">
                                  <div class="chapter-info">
                                      <span class="chapter-number">{{ idx + 1 }}</span>
                                      <div class="chapter-text">
                                          <h6 class="mb-1 fw-bold">{{ lesson.lesson_title }}</h6>
                                          <span v-if="lesson.lesson_content" class="text-muted small">
                                              {{ lesson.lesson_content.substring(0, 100) }}{{ lesson.lesson_content.length > 100 ? '...' : '' }}
                                          </span>
                                      </div>
                                  </div>
                                  <i class="fas fa-play-circle text-emerald"></i>
                              </div>
                          </div>
                          <div v-else class="text-muted">
                              <p>ยังไม่มีบทเรียนในเวอร์ชันที่เผยแพร่</p>
                          </div>
                      </template>
                      <template v-else>
                          <div class="alert alert-info mt-4">
                              <i class="fas fa-info-circle me-2"></i>
                              คอร์สนี้ยังไม่มีเนื้อหาที่เผยแพร่
                          </div>
                      </template>
                  </div>
              </div>

              <!-- Sidebar Info -->
              <div class="col-lg-4">
                  <div class="info-sidebar-card">
                      <h5 class="fw-bold mb-4">ข้อมูลเบื้องต้น</h5>
                      <div class="info-stat-list">
                          <div class="info-stat-item">
                              <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                              <div class="stat-details">
                                  <span class="stat-label">ปีที่เปิดสอน</span>
                                  <span class="stat-value">{{ courseYear }}</span>
                              </div>
                          </div>
                          <div class="info-stat-item">
                              <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
                              <div class="stat-details">
                                  <span class="stat-label">ผู้สอน</span>
                                  <span class="stat-value">{{ instructorNames }}</span>
                              </div>
                          </div>
                          <div v-if="course?.active_published_version_id" class="info-stat-item">
                              <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                              <div class="stat-details">
                                  <span class="stat-label">สถานะ</span>
                                  <span class="stat-value text-success">เผยแพร่แล้ว</span>
                              </div>
                          </div>
                          <div v-else class="info-stat-item">
                              <div class="stat-icon"><i class="fas fa-edit"></i></div>
                              <div class="stat-details">
                                  <span class="stat-label">สถานะ</span>
                                  <span class="stat-value text-warning">ฉบับร่าง</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// Layout components removed (global)
import { getCourseById, type Course } from '../courses.api';
import { listInstructors, type CourseInstructor } from '../courseInstructors.api';
import { listPublishedLessons, type Lesson } from '../lessons.api';
import { useEnrollmentsStore } from '../../enrollments/enrollments.store';
import { showSuccess, showError, showConfirm } from '@/core/utils/swal';
import { getImageUrl } from '../../../core/utils/image.helper';

const router = useRouter();
const route = useRoute();

// Layout state
// Data state
const course = ref<Course | null>(null);
const instructors = ref<CourseInstructor[]>([]);
const lessons = ref<Lesson[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isEnrolling = ref(false);

const enrollmentsStore = useEnrollmentsStore();

// Check if enrolled
const isEnrolled = computed(() => {
    return course.value ? enrollmentsStore.isEnrolled(course.value.course_id) : false;
});

const handleBack = () => {
    router.push('/courses');
};

// Computed properties for display with fallbacks
const courseName = computed(() => course.value?.course_name || 'กำลังโหลด...');
const courseYear = computed(() => course.value?.year || new Date().getFullYear());
const courseDescription = computed(() => course.value?.description || 'ไม่มีรายละเอียด');
const instructorNames = computed(() => {
    if (instructors.value.length === 0) return 'ไม่มีผู้สอน';
    return instructors.value.map(i => `${i.first_name || ''} ${i.last_name || ''}`.trim() || i.email).join(', ');
});

// Check if course has published content
const hasPublishedContent = computed(() => !!course.value?.active_published_version_id);

// Fetch course data
async function fetchCourseData() {
    const courseId = route.params.id;
    if (!courseId) {
        error.value = 'ไม่พบรหัสคอร์ส';
        isLoading.value = false;
        return;
    }

    try {
        isLoading.value = true;
        error.value = null;

        // Fetch course first
        const courseData = await getCourseById(courseId as string);
        course.value = courseData;

        // Try to fetch instructors (may fail for learners - that's OK)
        try {
            const instructorData = await listInstructors(courseId as string);
            instructors.value = instructorData;
        } catch (instructorError: any) {
            // Learners may not have permission to see instructors - just skip
            console.warn('Could not fetch instructors:', instructorError.response?.status);
            instructors.value = [];
        }

        // Fetch published lessons if course has published version
        if (courseData.active_published_version_id) {
            try {
                const lessonsData = await listPublishedLessons(courseId as string);
                lessons.value = lessonsData;
            } catch (lessonsError) {
                console.warn('Could not fetch lessons:', lessonsError);
                // Don't fail the whole page if lessons fail to load
            }
        }
        // Also fetch user enrollments to check status
        await enrollmentsStore.fetchMyCourses();

    } catch (e: any) {
        console.error('Error fetching course:', e);
        error.value = e.response?.data?.error || 'ไม่สามารถโหลดข้อมูลคอร์สได้';
    } finally {
        isLoading.value = false;
    }
}

async function handleEnroll() {
    if (!course.value) return;
    
    // Add confirmation dialog
    const confirm = await showConfirm(
        'ยืนยันการลงทะเบียน?',
        `คุณต้องการลงทะเบียนเรียนคอร์ส "${course.value.course_name}" ใช่หรือไม่`,
        'ใช่, ลงทะเบียน',
        'ยกเลิก'
    );

    if (!confirm.isConfirmed) return;
    
    isEnrolling.value = true;
    try {
        await enrollmentsStore.enroll(course.value.course_id);
        
        await showSuccess('ลงทะเบียนสำเร็จ!', 'คุณสามารถเริ่มเรียนได้ทันที');
        
    } catch (e: any) {
        showError('เกิดข้อผิดพลาด', e.message || 'ไม่สามารถลงทะเบียนได้');
    } finally {
        isEnrolling.value = false;
    }
}

onMounted(() => {
    fetchCourseData();
});
</script>

<style scoped>
.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.badge-year {
    background: #f1f5f9;
    color: #64748b;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
}

.btn-outline-emerald {
    color: #10b981;
    border-color: #10b981;
    background: transparent;
    transition: all 0.3s ease;
}

.btn-outline-emerald:hover {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.btn-header-success {
    background: white;
    color: #10b981;
    border: none;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 10px;
    transition: all 0.2s ease;
}

.btn-header-success:hover {
    background: #ecfdf5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-card-modern {
    background: white;
    border-radius: 20px;
    padding: 35px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.section-title-modern {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 25px;
    position: relative;
    padding-bottom: 12px;
}

.section-title-modern::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 4px;
    background: var(--primary-emerald, #10b981);
    border-radius: 10px;
}

.description-content {
    color: #475569;
    line-height: 1.8;
    font-size: 1.05rem;
}

.learning-list {
    list-style: none;
    padding: 0;
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
}

.text-emerald {
    color: #10b981;
}

.curriculum-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.curriculum-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8fafc;
    border-radius: 15px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.curriculum-item:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
}

.chapter-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.chapter-number {
    width: 36px;
    height: 36px;
    background: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #10b981;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.info-sidebar-card {
    background: white;
    border-radius: 20px;
    padding: 30px;
    position: sticky;
    top: 100px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.info-stat-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-stat-item {
    display: flex;
    align-items: center;
    gap: 15px;
}

.stat-icon {
    width: 45px;
    height: 45px;
    background: #f0fdf4;
    color: #10b981;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.stat-details {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 0.8rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

    .stat-value {
        color: #1e293b;
        font-weight: 600;
    }
</style>
