<template>
  <div class="my-lessons-list">
    <div class="content-wrapper">
        <div class="page-header-modern mb-4">
          <div class="header-content d-flex align-items-center justify-content-between">
            <div class="header-text">
               <router-link to="/my-courses" class="back-link-modern mb-2 d-inline-flex align-items-center">
                <i class="bi bi-arrow-left me-1"></i> กลับไปหน้าคอร์ส
              </router-link>
              <h1 class="page-title-modern">
                {{ courseName }}
              </h1>
              <p class="page-subtitle-modern">บทเรียนทั้งหมดในคอร์สนี้</p>
            </div>
            <div class="header-actions">
               <!-- Placeholder for progress or action buttons if needed -->
            </div>
          </div>
        </div>

    <!-- Lessons Body -->
    <div class="lessons-body">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">กำลังโหลดบทเรียน...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-5">
        <div class="error-icon mb-3">
          <i class="bi bi-exclamation-circle"></i>
        </div>
        <h4>เกิดข้อผิดพลาด</h4>
        <p class="text-muted">{{ error }}</p>
        <button class="btn btn-outline-primary" @click="fetchData">ลองใหม่</button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Announcements Section -->
        <div class="topic-card announcements" @click="toggleSection('announcements')">
          <div class="topic-header">
            <div class="topic-icon">
              <i class="bi bi-megaphone"></i>
            </div>
            <span class="topic-title">ประกาศ / Announcements</span>
            <i class="bi chevron-icon" :class="expandedSections.announcements ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </div>
          <div class="topic-content" v-show="expandedSections.announcements">
            <p class="text-muted mb-0 p-3">ยังไม่มีประกาศในขณะนี้</p>
          </div>
        </div>

        <!-- No Lessons -->
        <div v-if="lessons.length === 0" class="empty-state">
          <i class="bi bi-journal-x"></i>
          <h4>ยังไม่มีบทเรียนในคอร์สนี้</h4>
          <p class="text-muted">โปรดติดตาม เร็วๆ นี้</p>
        </div>

        <!-- Topic/Lesson List -->
        <div 
          v-for="(lesson, index) in lessons" 
          :key="lesson.lesson_id" 
          class="topic-card"
          :class="{ 'highlighted': index % 2 === 0 }"
        >
          <div class="topic-header" @click="toggleSection('lesson-' + lesson.lesson_id)">
            <span class="topic-title">
              <span class="topic-number">Topic {{ index + 1 }}:</span>
              {{ lesson.lesson_title }}
            </span>
            <i class="bi chevron-icon" :class="expandedSections['lesson-' + lesson.lesson_id] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </div>
          
          <div class="topic-content" v-show="expandedSections['lesson-' + lesson.lesson_id]">
            <!-- Lesson Content -->
            <router-link 
              :to="`/learning/${courseId}/lessons/${lesson.lesson_id}`"
              class="content-item"
            >
              <div class="content-icon lesson">
                <i class="bi bi-file-text"></i>
              </div>
              <div class="content-info">
                <span class="content-name">{{ lesson.lesson_title }}</span>
                <span class="content-desc" v-if="lesson.lesson_content">
                  {{ getPreview(lesson.lesson_content) }}
                </span>
              </div>
              <i class="bi bi-chevron-right content-arrow"></i>
            </router-link>

            <!-- Assignments for this lesson -->
            <router-link 
              v-for="assign in getAssignmentsForLesson(lesson.lesson_id)"
              :key="assign.assignment_id"
              :to="`/learning/${courseId}/assignments/${assign.assignment_id}`"
              class="content-item assignment"
            >
              <div class="content-icon assignment">
                <i class="bi bi-file-earmark-check"></i>
              </div>
              <div class="content-info">
                <span class="content-name">{{ assign.title }}</span>
                <span class="content-desc">
                  <span class="badge-score">{{ assign.max_score }} คะแนน</span>
                  <span v-if="assign.due_date" class="due-date">
                    <i class="bi bi-clock me-1"></i>
                    กำหนดส่ง: {{ formatDate(assign.due_date) }}
                  </span>
                </span>
              </div>
              <i class="bi bi-chevron-right content-arrow"></i>
            </router-link>
          </div>
        </div>

        <!-- Standalone Assignments Section -->
        <div 
          v-if="standaloneAssignments.length > 0"
          class="topic-card"
        >
          <div class="topic-header" @click="toggleSection('assignments-all')">
            <div class="topic-icon assignment">
              <i class="bi bi-clipboard-check"></i>
            </div>
            <span class="topic-title">แบบฝึกหัดทั้งหมด</span>
            <span class="badge bg-warning text-dark ms-2">{{ standaloneAssignments.length }}</span>
            <i class="bi chevron-icon" :class="expandedSections['assignments-all'] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </div>
          
          <div class="topic-content" v-show="expandedSections['assignments-all']">
            <router-link 
              v-for="assign in standaloneAssignments"
              :key="assign.assignment_id"
              :to="`/learning/${courseId}/assignments/${assign.assignment_id}`"
              class="content-item assignment"
            >
              <div class="content-icon assignment">
                <i class="bi bi-file-earmark-check"></i>
              </div>
              <div class="content-info">
                <span class="content-name">{{ assign.title }}</span>
                <span class="content-desc">
                  <span class="badge-score">{{ assign.max_score }} คะแนน</span>
                  <span v-if="assign.due_date" class="due-date">
                    กำหนดส่ง: {{ formatDate(assign.due_date) }}
                  </span>
                </span>
              </div>
              <i class="bi bi-chevron-right content-arrow"></i>
            </router-link>
          </div>
        </div>
      </div>
      </div> <!-- End lessons-body -->
      </div> <!-- End content-wrapper -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// Stores
import { useAssignmentsStore } from '../../assignments/assignments.store';
import { useEnrollmentsStore } from '../../enrollments/enrollments.store';
// APIs
import * as coursesApi from '../../courses/courses.api';
import * as lessonsApi from '../../courses/lessons.api'; 

// Types
import type { Lesson } from '../../courses/lessons.api';

const route = useRoute();
// const router = useRouter(); // Unused

// Stores
const assignmentsStore = useAssignmentsStore();
const enrollmentsStore = useEnrollmentsStore();

// State
const loading = ref(true);
const error = ref<string | null>(null);
const courseName = ref('');
const lessons = ref<Lesson[]>([]); 
const courseId = Number(route.params.courseId);

// Track expanded sections
const expandedSections = reactive<Record<string, boolean>>({
  'announcements': false,
  'assignments-all': true
});

// Get assignments for a specific lesson
const getAssignmentsForLesson = (lessonId: number) => {
  return assignmentsStore.getAssignmentsByLesson(lessonId);
};

// Standalone assignments (not linked to a lesson)
const standaloneAssignments = computed(() => {
  return assignmentsStore.assignments.filter(a => !a.lesson_id);
});

function toggleSection(key: string) {
  expandedSections[key] = !expandedSections[key];
}

function getPreview(content: string): string {
  if (!content) return '';
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > 80 ? text.substring(0, 80) + '...' : text;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

async function fetchData() {
  loading.value = true;
  error.value = null;
  try {
    const course = await coursesApi.getCourseById(courseId);
    courseName.value = course.course_name;

    const contentInfo = await enrollmentsStore.getCourseContent(courseId);
    const versionId = contentInfo.version_id;

    const fetchedLessons = await lessonsApi.listLessons(courseId, versionId);
    lessons.value = fetchedLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    // Auto-expand first lesson
    if (lessons.value.length > 0 && lessons.value[0]?.lesson_id) {
      expandedSections['lesson-' + lessons.value[0].lesson_id] = true;
    }

    // Fetch assignments
    await assignmentsStore.fetchAssignments(courseId);

  } catch (e: any) {
    console.error(e);
    error.value = e.message || 'ไม่สามารถโหลดบทเรียนได้';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (courseId) {
    fetchData();
  } else {
    error.value = 'Invalid parameters';
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
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header Modern */
.page-header-modern {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    color: white;
}

.page-title-modern {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
}

.page-subtitle-modern {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-size: 1rem;
}

.back-link-modern {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.back-link-modern:hover {
  color: white;
  transform: translateX(-2px);
}

/* Enrollment Banner */
.enrollment-banner {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  font-weight: 500;
  margin: 0 30px 24px; /* match wrapper padding */
  border-radius: 12px; /* Add radius */
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15); /* Soft shadow */
}

@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
  }
  .content-wrapper {
    padding: 20px;
  }
}

/* Topic Cards */
.topic-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.topic-card.highlighted {
  background: #f8fafc;
}

.topic-card.announcements {
  background: #f0fdf4; /* Light green tint */
  border-color: #bbf7d0;
}

.topic-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.topic-header:hover {
  background: rgba(0, 0, 0, 0.02);
}

.topic-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #10b981; /* Green */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.topic-icon.assignment {
  background: #f59e0b;
}

.topic-title {
  flex: 1;
  font-weight: 500;
  color: #064e3b; /* Dark Green */
  font-size: 0.95rem;
}

.topic-number {
  color: #64748b;
  font-weight: 400;
  margin-right: 8px;
}

.chevron-icon {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Topic Content */
.topic-content {
  border-top: 1px solid #e2e8f0;
}

.content-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.content-item:last-child {
  border-bottom: none;
}

.content-item:hover {
  background: #ecfdf5; /* Hover green tint */
}

.content-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.content-icon.lesson {
  background: #d1fae5;
  color: #059669;
}

.content-icon.assignment {
  background: #fef3c7;
  color: #d97706;
}

.content-info {
  flex: 1;
  min-width: 0;
}

.content-name {
  display: block;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 2px;
}

.content-desc {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: #64748b;
}

.badge-score {
  background: #fef3c7;
  color: #b45309;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.75rem;
}

.due-date {
  display: flex;
  align-items: center;
}

.content-arrow {
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
