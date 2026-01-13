<template>
  <div class="course-edit">
    <div class="content-wrapper">
        <!-- Page Header -->
        <div class="page-header-modern mb-4">
          <div class="header-content d-flex align-items-center justify-content-between">
            <div class="header-text">
              <nav class="breadcrumb-nav mb-2">
                <router-link to="/courses/manage" class="breadcrumb-link">
                  <i class="fas fa-arrow-left me-2"></i>การจัดการคอร์ส
                </router-link>
              </nav>
              <h1 class="page-title-modern">
                <i class="fas fa-edit me-2"></i>แก้ไขคอร์ส
              </h1>
              <p class="page-subtitle-modern">แก้ไขข้อมูลคอร์ส: {{ form.course_name || 'กำลังโหลด...' }}</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="content-card-modern text-center py-5">
          <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
          <p>กำลังโหลดข้อมูลคอร์ส...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="content-card-modern text-center py-5">
          <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
          <h5>ไม่พบคอร์ส</h5>
          <p class="text-muted">{{ loadError }}</p>
          <router-link to="/courses/manage" class="btn btn-primary-modern mt-3">
            <i class="fas fa-arrow-left me-2"></i>กลับไปหน้าจัดการคอร์ส
          </router-link>
        </div>

        <!-- Edit Form -->
        <div v-else class="content-card-modern">
          <h4 class="step-title mb-4">
            <i class="fas fa-info-circle me-2 text-primary"></i>ข้อมูลคอร์ส
          </h4>
          
          <div class="row g-4">
            <div class="col-12">
              <label class="form-label-modern">ชื่อคอร์ส <span class="text-danger">*</span></label>
              <input 
                v-model="form.course_name" 
                type="text" 
                class="form-control-modern"
                :class="{ 'is-invalid': errors.course_name }"
                placeholder="เช่น การพัฒนาเว็บไซต์สมัยใหม่"
              />
              <div v-if="errors.course_name" class="invalid-feedback">{{ errors.course_name }}</div>
            </div>
            
            <div class="col-md-6">
              <label class="form-label-modern">ปีการศึกษา <span class="text-danger">*</span></label>
              <select 
                v-model="form.year" 
                class="form-control-modern"
                :class="{ 'is-invalid': errors.year }"
              >
                <option value="">เลือกปี</option>
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <div v-if="errors.year" class="invalid-feedback">{{ errors.year }}</div>
            </div>
            
            <div class="col-md-6">
              <label class="form-label-modern">สถานะ</label>
              <div class="status-display">
                <span v-if="originalCourse?.active_published_version_id" class="badge-status published">
                  <i class="fas fa-check-circle me-1"></i>เผยแพร่แล้ว
                </span>
                <span v-else class="badge-status draft">
                  <i class="fas fa-file-alt me-1"></i>ฉบับร่าง
                </span>
              </div>
            </div>
            
            <div class="col-12">
              <label class="form-label-modern">รายละเอียดคอร์ส</label>
              <textarea 
                v-model="form.description" 
                class="form-control-modern"
                rows="4"
                placeholder="อธิบายเนื้อหาและสิ่งที่ผู้เรียนจะได้รับจากคอร์สนี้..."
              ></textarea>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="submitError" class="alert-modern error mt-4">
            <i class="fas fa-exclamation-circle me-2"></i>
            {{ submitError }}
          </div>

          <!-- Success Alert -->
          <div v-if="successMessage" class="alert-modern success mt-4">
            <i class="fas fa-check-circle me-2"></i>
            {{ successMessage }}
          </div>

          <!-- Action Buttons -->
          <div class="step-navigation">
            <router-link to="/courses/manage" class="btn btn-outline-modern">
              <i class="fas fa-arrow-left me-2"></i>ยกเลิก
            </router-link>
            <div class="flex-grow-1"></div>
            <button 
              type="button" 
              class="btn btn-success-modern"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin me-2"></i>กำลังบันทึก...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>บันทึกการเปลี่ยนแปลง
              </span>
            </button>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Layout components removed (global)
import { useCourseStore } from '../courses.store';
import type { Course } from '../courses.api';

const router = useRouter();
const route = useRoute();
const courseStore = useCourseStore();

// Sidebar state removed (global)

// Form state
const isLoading = ref(true);
const loadError = ref('');
const isSubmitting = ref(false);
const submitError = ref('');
const successMessage = ref('');
const originalCourse = ref<Course | null>(null);

const form = reactive({
  course_name: '',
  description: '',
  year: '' as number | string,
});

const errors = reactive({
  course_name: '',
  year: '',
});

// Options
const currentYear = new Date().getFullYear();
const availableYears = computed(() => {
  const years = [];
  for (let i = currentYear + 2; i >= 2020; i--) {
    years.push(i);
  }
  return years;
});

// Load course data
onMounted(async () => {
  const courseId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  if (!courseId) {
    loadError.value = 'ไม่พบ Course ID';
    isLoading.value = false;
    return;
  }

  try {
    await courseStore.fetchCourseById(courseId);
    const course = courseStore.currentCourse;
    
    if (course) {
      originalCourse.value = course;
      form.course_name = course.course_name;
      form.description = course.description || '';
      form.year = course.year || '';
    } else {
      loadError.value = 'ไม่พบคอร์สที่ต้องการแก้ไข';
    }
  } catch (err: any) {
    loadError.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
  } finally {
    isLoading.value = false;
  }
});

// Validation
const validateForm = () => {
  let valid = true;
  errors.course_name = '';
  errors.year = '';

  if (!form.course_name.trim()) {
    errors.course_name = 'กรุณากรอกชื่อคอร์ส';
    valid = false;
  }

  if (!form.year) {
    errors.year = 'กรุณาเลือกปีการศึกษา';
    valid = false;
  }

  return valid;
};

// Submit
const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!originalCourse.value) return;

  isSubmitting.value = true;
  submitError.value = '';
  successMessage.value = '';

  try {
    await courseStore.updateCourse(originalCourse.value.course_id, {
      course_name: form.course_name.trim(),
      description: form.description.trim() || undefined,
      year: Number(form.year),
    });
    
    successMessage.value = 'บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว';
    
    // Redirect after short delay
    setTimeout(() => {
      router.push('/courses/manage');
    }, 1500);
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.breadcrumb-nav {
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #10b981;
}

/* Form Card */
.content-card-modern {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.form-label-modern {
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: block;
}

.form-control-modern {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.form-control-modern:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.form-control-modern.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 6px;
  display: block;
}

/* Status Display */
.status-display {
  padding: 14px 18px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.badge-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.badge-status.published {
  background: #f0fdf4;
  color: #10b981;
}

.badge-status.draft {
  background: #f1f5f9;
  color: #64748b;
}

/* Alerts */
.alert-modern {
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
}

.alert-modern.error {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.alert-modern.success {
  background: #f0fdf4;
  color: #10b981;
  border: 1px solid #bbf7d0;
}

/* Navigation Buttons */
.step-navigation {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-outline-modern {
  padding: 12px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-outline-modern:hover {
  border-color: #94a3b8;
  color: #1e293b;
}

.btn-primary-modern {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-primary-modern:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-success-modern {
  padding: 12px 28px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success-modern:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-success-modern:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content-modern {
    margin-left: 0;
    padding: 1rem;
    padding-top: calc(72px + 1rem);
  }
}
</style>
