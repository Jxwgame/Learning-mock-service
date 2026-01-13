<template>
  <div class="learner-home-page">
    <div class="content-wrapper">
        <!-- Welcome Header -->
        <div class="welcome-header">
          <div class="header-content">
            <h1 class="welcome-title">ยินดีต้อนรับ, {{ userName }} 👋</h1>
            <p class="welcome-subtitle">เรียนรู้ทักษะใหม่ๆ พัฒนาตัวเองไปกับเรา</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">กำลังโหลด...</span>
          </div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Content -->
        <div v-else class="learner-content">
          <!-- Stats Section -->
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-icon cyan">
                <i class="bi bi-journal-bookmark"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ myCourses.length }}</div>
                <div class="stat-label">คอร์สที่ลงทะเบียน</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green">
                <i class="bi bi-collection"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ allCourses.length }}</div>
                <div class="stat-label">คอร์สทั้งหมด</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon amber">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ completedCourses }}</div>
                <div class="stat-label">เรียนจบแล้ว</div>
              </div>
            </div>
          </div>

          <!-- My Enrolled Courses -->
          <div class="section-block" v-if="myCourses.length > 0">
            <div class="section-header">
              <div class="section-title">
                <i class="bi bi-journal-bookmark-fill"></i>
                <h2>คอร์สที่กำลังเรียน</h2>
              </div>
              <router-link to="/my-courses" class="view-all-link">
                ดูทั้งหมด <i class="bi bi-arrow-right"></i>
              </router-link>
            </div>
            <div class="courses-grid">
              <div 
                v-for="course in myCourses.slice(0, 9)" 
                :key="'my-' + course.enrollment_id" 
                class="course-card enrolled"
              >
                <div class="course-image" :style="course.cover_image_url ? {} : getGradientStyle(course.course_id)">
                  <img v-if="course.cover_image_url" :src="getImageUrl(course.cover_image_url)" alt="Course Cover" class="course-cover-img">
                  <i v-else :class="getCourseIcon(course.course_name)"></i>
                </div>
                <div class="course-body">
                  <h3 class="course-title">{{ course.course_name || 'ไม่ระบุชื่อ' }}</h3>
                  <p class="course-desc">{{ course.description || 'ไม่มีคำอธิบาย' }}</p>
                  <div class="course-meta">
                    <span class="meta-item">
                      <i class="bi bi-calendar3"></i>
                      ปี {{ course.year || 'N/A' }}
                    </span>
                    <span class="badge" :class="course.status === 'completed' ? 'bg-success' : 'bg-primary'">
                      {{ course.status === 'completed' ? 'เรียนจบแล้ว' : 'กำลังเรียน' }}
                    </span>
                  </div>
                  <router-link 
                    :to="`/learning/${course.course_id}`" 
                    class="btn btn-continue"
                  >
                    <i class="bi bi-journal-text me-2"></i>
                    ไปยังบทเรียน
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for My Courses -->
          <div class="section-block empty-state" v-else>
            <div class="empty-icon">
              <i class="bi bi-journal-x"></i>
            </div>
            <h3>คุณยังไม่ได้ลงทะเบียนคอร์สใดๆ</h3>
            <p>เริ่มต้นการเรียนรู้โดยการลงทะเบียนคอร์สที่สนใจ</p>
            <router-link to="/enroll" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>
              ลงทะเบียนคอร์ส
            </router-link>
          </div>

          <!-- All Available Courses -->
          <div class="section-block">
            <div class="section-header">
              <div class="section-title">
                <i class="bi bi-fire"></i>
                <h2>คอร์สแนะนำ</h2>
              </div>
              <router-link to="/enroll" class="view-all-link">
                ดูทั้งหมด <i class="bi bi-arrow-right"></i>
              </router-link>
            </div>
            <div class="courses-grid">
              <div 
                v-for="course in filteredCourses.slice(0, 9)" 
                :key="'all-' + course.course_id" 
                class="course-card"
              >
                <div class="course-image" :style="course.cover_image_url ? {} : getGradientStyle(course.course_id)">
                  <img v-if="course.cover_image_url" :src="getImageUrl(course.cover_image_url)" alt="Course Cover" class="course-cover-img">
                  <i v-else :class="getCourseIcon(course.course_name)"></i>
                </div>
                <div class="course-body">
                  <h3 class="course-title">{{ course.course_name }}</h3>
                  <p class="course-desc">{{ course.description || 'ไม่มีคำอธิบาย' }}</p>
                  <div class="course-meta">
                    <span class="meta-item">
                      <i class="bi bi-calendar3"></i>
                      ปี {{ course.year || 'N/A' }}
                    </span>
                    <span class="meta-item" v-if="course.enrollment_count">
                      <i class="bi bi-people"></i>
                      {{ course.enrollment_count }} คน
                    </span>
                  </div>
                  <button 
                    v-if="!isEnrolled(course.course_id)"
                    class="btn btn-enroll"
                    @click="handleEnroll(course.course_id)"
                    :disabled="enrolling === course.course_id"
                  >
                    <span v-if="enrolling === course.course_id">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      กำลังลงทะเบียน...
                    </span>
                    <span v-else>
                      <i class="bi bi-plus-circle me-2"></i>
                      ลงทะเบียนเรียน
                    </span>
                  </button>
                  <router-link 
                    v-else
                    :to="`/learning/${course.course_id}`" 
                    class="btn btn-continue"
                  >
                    <i class="bi bi-play-circle me-2"></i>
                    เข้าเรียน
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
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../auth.store";
import { useEnrollmentsStore } from "../../enrollments/enrollments.store"; 
import type { Enrollment } from "../../enrollments/enrollments.api";
import { getCourses } from "../../courses/courses.api";
// import { getMyEnrollments as getMyCourses } from "../../enrollments/enrollments.api"; // Removed, use store
// Assuming CourseListItem is not found, use helper or ANY for now if strictly needed, or just Course if compatible. 
// actually getCourses returns Course[]. 
import type { Course } from "../../courses/courses.api";
import { getImageUrl } from "@/core/utils/image.helper";

// Layout components removed (global)

// Auth store
const authStore = useAuthStore();
const enrollmentStore = useEnrollmentsStore();

// Utility

// Types
type CourseListItem = Course; // Alias for compatibility


const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "ผู้เรียน";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "ผู้เรียน";
});

// API data
const loading = ref(true);
const myCourses = ref<Enrollment[]>([]);
const allCourses = ref<CourseListItem[]>([]);
const enrolling = ref<number | null>(null);

const completedCourses = computed(() => {
  return myCourses.value.filter(c => c.status === "completed").length;
});

const filteredCourses = computed(() => {
  // Filter out courses that are already enrolled
  const enrolledIds = myCourses.value.map(c => c.course_id);
  const courses = allCourses.value.filter(c => !enrolledIds.includes(c.course_id));
  return courses;
});

const isEnrolled = (courseId: number) => {
  return myCourses.value.some(c => c.course_id === courseId && c.status === "active");
};

// Gradient styles for course cards
const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
];

const getGradientStyle = (id: number) => {
  return { background: gradients[id % gradients.length] };
};

const getCourseIcon = (name?: string) => {
  if (!name) return "bi bi-book";
  const lower = name.toLowerCase();
  if (lower.includes("python") || lower.includes("programming") || lower.includes("code")) return "bi bi-code-slash";
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) return "bi bi-palette";
  if (lower.includes("marketing") || lower.includes("business")) return "bi bi-graph-up";
  if (lower.includes("photo") || lower.includes("video")) return "bi bi-camera-video";
  if (lower.includes("ai") || lower.includes("machine")) return "bi bi-robot";
  if (lower.includes("english") || lower.includes("language")) return "bi bi-translate";
  return "bi bi-book";
};

// Import swal utility
import { showConfirm, showSuccess, showError, showLoading, closeDialog } from "@/core/utils/swal";

const handleEnroll = async (courseId: number) => {
  try {
    const confirmed = await showConfirm(
      "ยืนยันการลงทะเบียน",
      "คุณต้องการลงทะเบียนเรียนคอร์สนี้ใช่หรือไม่?",
      "ลงทะเบียน",
      "ยกเลิก"
    );

    if (!confirmed.isConfirmed) return;

    showLoading("กำลังลงทะเบียน...");
    enrolling.value = courseId;
    await enrollmentStore.enroll(courseId);
    await enrollmentStore.fetchMyCourses();
    myCourses.value = enrollmentStore.myCourses;
    
    closeDialog();
    showSuccess("ลงทะเบียนสำเร็จ", "คุณสามารถเริ่มเรียนได้ทันที");
  } catch (error: any) {
    console.error("Enrollment failed:", error);
    closeDialog();
    showError("ไม่สามารถลงทะเบียนได้", error.message || "กรุณาลองใหม่อีกครั้ง");
  } finally {
    enrolling.value = null;
  }
};

// Load data on mount
onMounted(async () => {
  try {
    loading.value = true;
    await Promise.all([
      enrollmentStore.fetchMyCourses(),
      getCourses()
    ]);
    
    // Sync state
    myCourses.value = enrollmentStore.myCourses;
    // Assuming getCourses returns the list directly
    const fetchedCourses = await getCourses();
    // Filter only published courses
    allCourses.value = fetchedCourses.filter(c => c.active_published_version_id);
  } catch (error) {
    console.error("Failed to load courses:", error);
  } finally {
    loading.value = false;
  }
});
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

/* Welcome Header */
.welcome-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

.header-content {
  text-align: left;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.welcome-subtitle {
  opacity: 0.9;
  font-size: 1rem;
  margin: 0;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.loading-state p {
  color: #64748b;
  margin-top: 15px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.cyan { background: #ecfeff; color: #0891b2; }
.stat-icon.green { background: #ecfdf5; color: #059669; }
.stat-icon.amber { background: #fffbeb; color: #f59e0b; }

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

/* Section Block */
.section-block {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title i {
  font-size: 1.5rem;
  color: #059669;
}

.section-title h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.view-all-link {
  color: #059669;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.2s ease;
}

.view-all-link:hover {
  gap: 10px;
  color: #047857;
}

/* Courses Grid */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.course-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.course-card.enrolled {
  border-color: #059669;
}

.course-image {
  height: 160px;
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

.course-card:hover .course-cover-img {
  transform: scale(1.05);
}

.course-image i {
  font-size: 3rem;
  color: white;
  z-index: 1;
}

.enrolled-badge-modern {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.badge-content {
  background: rgba(255, 255, 255, 0.95);
  color: #059669;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.course-card:hover .badge-content {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.course-body {
  padding: 20px;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
  line-height: 1.4;
}

.course-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #64748b;
}

.meta-item i {
  color: #059669;
}

.btn-enroll, .btn-continue {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.btn-enroll {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
}

.btn-enroll:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
  color: white;
}

.btn-enroll:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-continue {
  background: white;
  color: #059669;
  border: 1px solid #059669; /* Thinner border looks improved */
  text-decoration: none;
}

.btn-continue:hover {
  background: #ecfdf5;
  color: #047857;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ecfdf5; /* Green tint */
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-icon i {
  font-size: 2.5rem;
  color: #10b981;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #0f172a;
  margin-bottom: 8px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .welcome-header {
    padding: 24px;
    text-align: center;
  }

  .header-content {
    text-align: center;
  }
}
</style>
