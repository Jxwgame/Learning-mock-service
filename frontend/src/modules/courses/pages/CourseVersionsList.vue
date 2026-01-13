<template>
  <div class="course-versions-list">
    <div class="content-wrapper">
      <div class="content-wrapper">
        <div class="page-header-modern mb-4">
          <h1 class="page-title-modern">
            <i class="fas fa-code-branch me-2"></i>ประวัติเวอร์ชัน (ทุกคอร์ส)
          </h1>
          <p class="page-subtitle-modern">เลือกคอร์สเพื่อดูรายละเอียดเวอร์ชัน</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p class="mt-3">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Course List -->
        <div v-else class="content-card-modern">
          <div class="course-grid">
            <div v-for="course in courses" :key="course.course_id" class="course-card" @click="goToInstructor(course.course_id)">
              <div class="course-icon">📚</div>
              <div class="course-info">
                <h5>{{ course.course_name }}</h5>
                <span class="course-year">รุ่นปี {{ course.year }}</span>
              </div>
              <div class="course-status">
                <span v-if="course.active_published_version_id" class="badge published">Published</span>
                <span v-else class="badge draft">Draft</span>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>
            
            <div v-if="courses.length === 0" class="empty-state">
              <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
              <p>ยังไม่มีคอร์ส</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Layout components removed (global)
import { useCourseStore } from '../courses.store';

const router = useRouter();
const courseStore = useCourseStore();

// Sidebar state removed (global)

onMounted(() => {
  courseStore.fetchManagedCourses();
});

const courses = computed(() => courseStore.managedCourses || []);
const loading = computed(() => courseStore.loading);

const goToInstructor = (courseId: number) => {
  router.push(`/courses/instructor/${courseId}`);
};
</script>

<style scoped>
.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}
.content-card-modern { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.course-grid { display: flex; flex-direction: column; gap: 12px; }
.course-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #f8fafc; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.course-card:hover { background: #f0fdf4; transform: translateX(4px); }
.course-icon { font-size: 2rem; }
.course-info { flex: 1; }
.course-info h5 { margin: 0; font-weight: 600; color: #1e293b; }
.course-year { font-size: 0.85rem; color: #64748b; }
.badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge.published { background: #dcfce7; color: #16a34a; }
.badge.draft { background: #fef3c7; color: #d97706; }
.empty-state { text-align: center; padding: 60px; }
@media (max-width: 768px) { .main-content-modern { margin-left: 0; padding: 1rem; padding-top: calc(72px + 1rem); } }
</style>
