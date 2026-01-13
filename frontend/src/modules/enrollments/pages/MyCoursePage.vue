<template>
  <div class="my-course-page">
    <div class="content-wrapper">

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <h1><i class="fas fa-book-reader"></i> คอร์สของฉัน</h1>
            <p>คอร์สเรียนทั้งหมดที่คุณลงทะเบียนไว้</p>
          </div>
        </div>

        <div class="d-flex justify-content-end mb-3">
          <router-link to="/enroll" class="btn btn-outline-emerald">
            <i class="fas fa-plus"></i> ลงทะเบียนคอร์สใหม่
          </router-link>
        </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>กำลังโหลดคอร์สของคุณ...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="fetchData">ลองใหม่</button>
      </div>

      <!-- Empty State -->
      <!-- Empty State Modern -->
      <div v-else-if="enrolledCourses.length === 0" class="empty-state-modern">
        <div class="empty-icon-wrapper">
          <div class="icon-circle">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="decorative-dots"></div>
        </div>
        <h3 class="empty-title">ยังไม่มีคอร์สในคลังความรู้</h3>
        <p class="empty-desc">เริ่มต้นการเรียนรู้ของคุณวันนี้! สำรวจคอร์สเรียนมากมายที่เราคัดสรรมาเพื่อคุณ</p>
        <router-link to="/courses" class="btn btn-emerald-gradient btn-lg">
          <i class="fas fa-search me-2"></i> ค้นหาคอร์สและลงทะเบียน
        </router-link>
      </div>

      <!-- Course Grid -->
      <div v-else class="row">
        <div
          v-for="course in enrolledCourses"
          :key="course.course_id"
          class="col-md-6 col-lg-4"
        >
          <div class="course-card">
            <div class="course-thumbnail" :style="course.cover_image_url ? {} : getGradientStyle(course.course_id)">
              <img 
                v-if="course.cover_image_url" 
                :src="getImageUrl(course.cover_image_url)" 
                alt="Course Cover" 
                class="course-cover-img"
              >
              <span v-else>{{ getCourseInitials(course.course_name) }}</span>
            </div>
            <div class="course-body">
              <h5 class="course-title">{{ course.course_name }}</h5>
              <p class="course-description">
                {{ course.description || 'ไม่มีคำอธิบาย' }}
              </p>
              <div class="enrolled-date">
                <i class="fas fa-calendar-check"></i>
                ลงทะเบียนเมื่อ: {{ formatDate(course.enrolled_at) }}
              </div>
              <div class="button-group">
                <router-link
                  :to="`/learning/${course.course_id}`"
                  class="btn btn-continue"
                >
                  <i class="fas fa-play-circle"></i> เข้าเรียน
                </router-link>
                <router-link
                  :to="`/courses/detail/${course.course_id}`"
                  class="btn btn-view"
                >
                  <i class="fas fa-info-circle"></i> รายละเอียด
                </router-link>
              </div>
              <button
                class="btn btn-unenroll mt-2"
                :disabled="unenrollingId === course.course_id"
                @click="handleUnenroll(course.course_id, course.course_name)"
              >
                <span v-if="unenrollingId === course.course_id">
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  กำลังยกเลิก...
                </span>
                <span v-else>
                  <i class="fas fa-times-circle"></i> ยกเลิกลงทะเบียน
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEnrollmentsStore } from '../enrollments.store';
import type { Enrollment } from '../enrollments.api';
import { showSuccess, showError, showConfirm } from '@/core/utils/swal';
import { getImageUrl } from '@/core/utils/image.helper';

// Utilities

const enrollmentsStore = useEnrollmentsStore();

const loading = ref(false);
const error = ref<string | null>(null);
const unenrollingId = ref<number | null>(null);

// Type alias if needed, or just use Enrollment
// Enhance type to ensure course_name is string (handled by computed)
interface EnrolledCourseWithDetails extends Omit<Enrollment, 'course_name'> {
  course_name: string;
}

const enrolledCourses = computed<EnrolledCourseWithDetails[]>(() => {
  return enrollmentsStore.myCourses.map((enrollment) => ({
    ...enrollment,
    course_name: enrollment.course_name || `Course #${enrollment.course_id}`,
  }));
});

async function fetchData() {
  loading.value = true;
  error.value = null;
  try {
    await enrollmentsStore.fetchMyCourses();
    // Course details are now included in the enrollment response from backend
  } catch (e: any) {
    error.value = e.message || 'ไม่สามารถโหลดข้อมูลได้';
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

function getGradientStyle(courseId: number) {
  return { background: gradients[courseId % gradients.length] };
}

function getCourseInitials(courseName?: string): string {
  if (!courseName) return 'CO';
  const words = courseName.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return ((words[0]?.[0] || '') + (words[1]?.[0] || '')).toUpperCase();
  }
  return courseName.substring(0, 2).toUpperCase();
}

async function handleUnenroll(courseId: number, courseName: string) {
  const confirm = await showConfirm(
    'คุณต้องการยกเลิกลงทะเบียน?',
    `คอร์ส "${courseName}" จะถูกลบออกจากรายการคอร์สของคุณ`,
    'ใช่, ยกเลิก',
    'ไม่'
  );

  if (!confirm.isConfirmed) return;

  unenrollingId.value = courseId;
  try {
    await enrollmentsStore.unenroll(courseId);
    await showSuccess(
      'ยกเลิกเรียบร้อย!',
      'คุณได้ยกเลิกลงทะเบียนคอร์สแล้ว'
    );
  } catch (e: any) {
    showError(
      'เกิดข้อผิดพลาด',
      e.message || 'ไม่สามารถยกเลิกลงทะเบียนได้'
    );
  } finally {
    unenrollingId.value = null;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.backoffice-layout {
  min-height: 100vh;
  background: #f8fafc;
}

/* Main content styles removed (global) */

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.header-content p {
  opacity: 0.9;
  margin: 0;
}

.btn-outline-emerald {
  background: white;
  color: #059669;
  border: 1px solid #059669;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-outline-emerald:hover {
  background: #059669;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.loading-state,
.error-state,
/* Modern Empty State */
.empty-state-modern {
  text-align: center;
  padding: 100px 30px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  max-width: 600px;
  margin: 40px auto;
  position: relative;
  overflow: hidden;
}

.empty-state-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #059669, #34d399);
}

.empty-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle {
  width: 100px;
  height: 100px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
  font-size: 3.5rem;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.15);
  transition: transform 0.4s ease;
}

.empty-state-modern:hover .icon-circle {
  transform: scale(1.05) rotate(5deg);
}

.decorative-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 2px dashed #a7f3d0;
  animation: spin 20s linear infinite;
  z-index: 1;
}

@keyframes spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.empty-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.empty-desc {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 32px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.btn-emerald-gradient {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 10px 20px rgba(5, 150, 105, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-emerald-gradient:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(5, 150, 105, 0.35);
  color: white;
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.course-thumbnail {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  overflow: hidden;
  position: relative;
}

.course-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-cover-img {
  transform: scale(1.05);
}

.course-body {
  padding: 20px;
}

.course-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 10px;
  line-height: 1.4;
}

.course-description {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.enrolled-date {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 15px;
}

.enrolled-date i {
  color: #059669;
  margin-right: 6px;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #64748b;
}

.progress {
  height: 8px;
  border-radius: 10px;
  background-color: #e2e8f0;
}

.progress-bar {
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn-view {
  flex: 1;
  background: #ecfdf5;
  color: #059669;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-view:hover {
  background: #d1fae5;
  color: #047857;
}

.btn-continue {
  flex: 1;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
  color: white;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
  }
  
  .button-group {
    flex-direction: column;
  }
}

.btn-unenroll {
  width: 100%;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.btn-unenroll:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.btn-unenroll:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
