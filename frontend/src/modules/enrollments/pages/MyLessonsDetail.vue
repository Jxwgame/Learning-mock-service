<template>
  <div class="my-lesson-detail-page">
    <div class="content-wrapper">
      <router-link :to="`/learning/${courseId}`" class="back-text">
        <i class="fas fa-arrow-left me-2"></i> กลับไปหน้าบทเรียนทั้งหมด
      </router-link>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">กำลังโหลดเนื้อหา...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-5">
        <div class="text-danger mb-3">
          <i class="fas fa-exclamation-circle fa-2x"></i>
        </div>
        <h3>เกิดข้อผิดพลาด</h3>
        <p class="text-muted">{{ error }}</p>
        <button class="btn btn-outline-primary" @click="fetchData">ลองใหม่</button>
      </div>

      <div v-else class="lesson-container">
        <!-- Header -->
        <div class="lesson-header animate-fade-in">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="badge bg-primary text-white px-3 py-2 rounded-pill">บทที่ {{ lessonIndex + 1 }}</span>
          </div>
          <h1 class="lesson-title">{{ lesson?.lesson_title }}</h1>
          <p class="lesson-description" v-if="lesson?.lesson_content">
             {{ lesson.lesson_content }}
          </p>
        </div>

        <!-- Content Blocks -->
        <div class="content-card animate-fade-in delay-1">
          <div v-if="contents.length > 0">
            <div v-for="item in contents" :key="item.content_id" class="mb-4 content-item">
              
              <!-- Text -->
              <div v-if="item.content_type === 'Text'" class="text-content" style="white-space: pre-wrap;">
                {{ item.content_text }}
              </div>

              <!-- Video -->
              <div v-else-if="item.content_type === 'Video'" class="video-content">
                 <div v-if="getEmbedUrl(item.content_file_url || '')" class="ratio ratio-16x9 rounded-4 overflow-hidden bg-black shadow-sm">
                    <iframe :src="getEmbedUrl(item.content_file_url || '') ?? undefined" allowfullscreen></iframe>
                  </div>
                  <div v-else class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> วิดีโอไม่สามารถเล่นได้ (Invalid URL)
                  </div>
              </div>

              <!-- File -->
              <div v-else-if="item.content_type === 'File'" class="file-content p-4 border rounded-3 bg-light d-flex align-items-center gap-3 hover-shadow transition">
                 <div class="bg-white p-2 rounded-circle shadow-sm">
                   <i class="fas fa-file-alt fa-2x text-primary"></i>
                 </div>
                 <div class="flex-grow-1 overflow-hidden">
                    <div class="fw-bold text-truncate text-dark">{{ getFileName(item.content_file_url || '') }}</div>
                    <small class="text-muted text-uppercase">{{ item.file_type || 'FILE' }}</small>
                 </div>
                 <a :href="item.content_file_url" target="_blank" class="btn btn-sm btn-primary rounded-pill px-3">
                     <i class="fas fa-download me-1"></i> ดาวน์โหลด
                 </a>
              </div>

            </div>
          </div>

          <div v-else class="text-center py-5 text-muted">
            <i class="fas fa-book-open fa-2x mb-3 opacity-50"></i>
            <p>ยังไม่มีเนื้อหาเพิ่มเติมในบทเรียนนี้</p>
          </div>
        </div>

        <!-- Assignments Section -->
        <div v-if="lessonAssignments.length > 0" class="assignments-section mt-5 mb-5 animate-fade-in delay-2">
          <h4 class="section-heading mb-4">
              <i class="fas fa-tasks me-2 text-warning"></i> แบบฝึกหัดท้ายบท
          </h4>
          <div class="d-flex flex-column gap-3">
              <router-link 
                  v-for="assign in lessonAssignments" 
                  :key="assign.assignment_id"
                  :to="`/learning/${courseId}/assignments/${assign.assignment_id}`"
                  class="assignment-card"
              >
                  <div class="flex-grow-1">
                      <h5 class="assignment-title">{{ assign.title }}</h5>
                      <div class="d-flex gap-3 text-muted small mt-2">
                          <span><i class="fas fa-star me-1 text-warning"></i> {{ assign.max_score }} คะแนน</span>
                          <span v-if="assign.due_date"><i class="fas fa-clock me-1"></i> ส่งภายใน: {{ new Date(assign.due_date).toLocaleDateString('th-TH') }}</span>
                      </div>
                  </div>
                  <div class="action-btn">
                      <span>ทำแบบฝึกหัด</span> <i class="fas fa-arrow-right ms-1"></i>
                  </div>
              </router-link>
          </div>
        </div>

        <!-- Navigation -->
        <div class="d-flex justify-content-between mt-5 pt-4 border-top">
          <router-link 
            v-if="prevLessonId" 
            :to="`/learning/${courseId}/lessons/${prevLessonId}`" 
            class="nav-lesson-btn"
          >
            ← บทก่อนหน้า
          </router-link>
          <div v-else></div>

          <router-link 
            v-if="nextLessonId" 
            :to="`/learning/${courseId}/lessons/${nextLessonId}`" 
            class="nav-lesson-btn next"
          >
            บทต่อไป →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEnrollmentsStore } from '../enrollments.store';
import { useAssignmentsStore } from '../assignments.store';
import { lessonsApi, type Lesson, type LessonContent } from '@/modules/courses/lessons.api';

const route = useRoute();
const enrollmentsStore = useEnrollmentsStore();
const assignmentsStore = useAssignmentsStore();

const courseId = computed(() => Number(route.params.courseId));
const lessonId = computed(() => Number(route.params.lessonId));

const lesson = ref<Lesson | null>(null);
const contents = ref<LessonContent[]>([]);
const allLessons = ref<Lesson[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const lessonAssignments = computed(() => {
    return assignmentsStore.getAssignmentsByLesson(lessonId.value);
});

const lessonIndex = computed(() => {
  if (!lesson.value || allLessons.value.length === 0) return -1;
  return allLessons.value.findIndex(l => l.lesson_id === lesson.value?.lesson_id);
});

const nextLessonId = computed(() => {
  const idx = lessonIndex.value;
  if (idx !== -1 && idx < allLessons.value.length - 1) {
    return allLessons.value[idx + 1]?.lesson_id;
  }
  return null;
});

const prevLessonId = computed(() => {
  const idx = lessonIndex.value;
  if (idx > 0) {
    return allLessons.value[idx - 1]?.lesson_id;
  }
  return null;
});

function getFileName(url: string) {
    if (!url) return 'Unknown File';
    try {
        return url.split('/').pop() || url;
    } catch (e) {
        return url;
    }
}

function getEmbedUrl(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
}

async function fetchData() {
  loading.value = true;
  error.value = null;
  
  try {
    if (!courseId.value || !lessonId.value) throw new Error('Invalid URL parameters');

    const contentInfo = await enrollmentsStore.getCourseContent(courseId.value);
    const versionId = contentInfo.version_id;

    allLessons.value = await lessonsApi.listLessons(courseId.value, versionId);
    allLessons.value.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const current = allLessons.value.find(l => l.lesson_id === lessonId.value);
    if (!current) throw new Error('Lesson not found in this course');
    lesson.value = current;

    const contentList = await lessonsApi.listLessonContents(lessonId.value);
    contents.value = contentList.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

    await assignmentsStore.fetchAssignments(courseId.value);

  } catch (e: any) {
    console.error(e);
    error.value = e.message || 'ไม่สามารถโหลดเนื้อหาได้';
  } finally {
    loading.value = false;
  }
}

watch([courseId, lessonId], () => {
    fetchData();
}, { immediate: true });

</script>

<style scoped>
.my-lesson-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 20px 20px;
}

.back-text {
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  margin-bottom: 30px;
  transition: color 0.2s;
}

.back-text:hover { color: #0d6efd; }

.lesson-container {
    animation: fadeIn 0.4s ease-out;
}

.lesson-header {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
  border: 1px solid #f1f3f5;
}

.lesson-title {
  color: #212529;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 15px;
  line-height: 1.25;
}

.lesson-description {
  color: #6c757d;
  font-size: 1.1rem;
  line-height: 1.7;
}

.content-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  margin-bottom: 40px;
  border: 1px solid #f1f3f5;
}

.content-item {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #334155;
    margin-bottom: 2rem;
}

.text-content {
    font-family: 'Sarabun', sans-serif;
}

.assignments-section {
    background: #fff8e1;
    padding: 30px;
    border-radius: 20px;
    border: 1px solid #ffeec2;
}

.section-heading {
    color: #495057;
    font-weight: 700;
}

.assignment-card {
    background: white;
    padding: 20px 25px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 5px solid #ffc107;
    transition: all 0.2s ease;
}

.assignment-title {
    color: #212529;
    font-weight: 700;
    margin: 0;
}

.assignment-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.action-btn {
    color: #0d6efd;
    font-weight: 600;
    background: #f0f7ff;
    padding: 8px 16px;
    border-radius: 50px;
    font-size: 0.9rem;
    white-space: nowrap;
}

.nav-lesson-btn {
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 12px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.nav-lesson-btn:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: #212529;
}

.nav-lesson-btn.next {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.nav-lesson-btn.next:hover {
  background: #0b5ed7;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.delay-1 { animation-delay: 0.1s; animation-fill-mode: backwards; }
.delay-2 { animation-delay: 0.2s; animation-fill-mode: backwards; }

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.hover-shadow:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}
.transition { transition: all 0.2s; }
</style>
