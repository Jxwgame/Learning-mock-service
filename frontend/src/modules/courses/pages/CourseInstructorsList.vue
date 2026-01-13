<template>
  <div class="course-instructors-list">
    <div class="content-wrapper">
        <div class="page-header-modern mb-4">
          <h1 class="page-title-modern">
            <i class="fas fa-chalkboard-teacher me-2"></i>รายชื่อผู้สอน (ทั้งหมด)
          </h1>
          <p class="page-subtitle-modern">เลือกคอร์สเพื่อดูรายละเอียดผู้สอน</p>
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
              <div class="course-icon bg-emerald-100 text-emerald-600">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="course-info">
                <h5>{{ course.course_name }}</h5>
                <span class="course-year">รุ่นปี {{ course.year }}</span>
              </div>
              <div class="course-actions">
                <span class="text-muted small me-2">จัดการผู้สอน</span>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
            
            <div v-if="courses.length === 0" class="empty-state">
              <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
              <p>ยังไม่มีคอร์ส</p>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
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
.content-card-modern { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.course-grid { display: flex; flex-direction: column; gap: 12px; }
.course-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #f8fafc; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.course-card:hover { background: #f0fdf4; transform: translateX(4px); }
.course-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.course-info { flex: 1; }
.course-info h5 { margin: 0; font-weight: 600; color: #1e293b; }
.course-year { font-size: 0.85rem; color: #64748b; }
.empty-state { text-align: center; padding: 60px; }
@media (max-width: 768px) { .main-content-modern { margin-left: 0; padding: 1rem; padding-top: calc(72px + 1rem); } }
</style>
