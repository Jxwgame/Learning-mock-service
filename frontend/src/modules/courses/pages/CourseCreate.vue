<template>
  <div class="course-create">
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
                <i class="fas fa-plus-circle me-2"></i>สร้างคอร์สใหม่
              </h1>
              <p class="page-subtitle-modern">กรอกข้อมูลเพื่อสร้างคอร์สเรียนใหม่ในระบบ</p>
            </div>
          </div>
        </div>

        <!-- Stepper Progress -->
        <div class="stepper-container mb-4">
          <div class="stepper">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id"
              class="step-item"
              :class="{ 
                'active': currentStep === index + 1, 
                'completed': currentStep > index + 1 
              }"
            >
              <div class="step-circle">
                <i v-if="currentStep > index + 1" class="fas fa-check"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="step-label">{{ step.title }}</div>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="content-card-modern">
          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 1" class="step-content">
            <h4 class="step-title mb-4">
              <i class="fas fa-info-circle me-2 text-primary"></i>ข้อมูลพื้นฐาน
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
                <label class="form-label-modern">ไอคอนคอร์ส</label>
                <div class="icon-picker">
                  <button 
                    v-for="icon in courseIcons" 
                    :key="icon"
                    type="button"
                    class="icon-option"
                    :class="{ 'selected': selectedIcon === icon }"
                    @click="selectedIcon = icon"
                  >
                    {{ icon }}
                  </button>
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
          </div>

          <!-- Step 2: Settings -->
          <div v-if="currentStep === 2" class="step-content">
            <h4 class="step-title mb-4">
              <i class="fas fa-cog me-2 text-primary"></i>ตั้งค่าคอร์ส
            </h4>
            
            <div class="row g-4">
              <div class="col-md-6">
                <label class="form-label-modern">ระดับความยาก</label>
                <div class="level-selector">
                  <button 
                    v-for="level in difficultyLevels" 
                    :key="level.value"
                    type="button"
                    class="level-option"
                    :class="{ 'selected': selectedLevel === level.value }"
                    @click="selectedLevel = level.value"
                  >
                    <i :class="level.icon"></i>
                    <span>{{ level.label }}</span>
                  </button>
                </div>
              </div>
              
              <div class="col-md-6">
                <label class="form-label-modern">ประเภทคอร์ส</label>
                <div class="type-cards">
                  <div 
                    class="type-card"
                    :class="{ 'selected': courseType === 'free' }"
                    @click="courseType = 'free'"
                  >
                    <i class="fas fa-gift"></i>
                    <span>ฟรี</span>
                  </div>
                  <div 
                    class="type-card"
                    :class="{ 'selected': courseType === 'paid' }"
                    @click="courseType = 'paid'"
                  >
                    <i class="fas fa-crown"></i>
                    <span>พรีเมียม</span>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <label class="form-label-modern">แท็ก / หมวดหมู่</label>
                <div class="tags-input-wrapper">
                  <div class="tags-display">
                    <span v-for="(tag, index) in tags" :key="index" class="tag-badge">
                      {{ tag }}
                      <button type="button" class="tag-remove" @click="removeTag(index)">
                        <i class="fas fa-times"></i>
                      </button>
                    </span>
                    <input 
                      v-model="tagInput"
                      type="text"
                      class="tag-input"
                      placeholder="พิมพ์แล้วกด Enter เพื่อเพิ่มแท็ก..."
                      @keydown.enter.prevent="addTag"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Review -->
          <div v-if="currentStep === 3" class="step-content">
            <h4 class="step-title mb-4">
              <i class="fas fa-check-double me-2 text-primary"></i>ตรวจสอบข้อมูล
            </h4>
            
            <div class="review-summary">
              <div class="review-card">
                <div class="review-icon-large">{{ selectedIcon }}</div>
                <div class="review-details">
                  <h3 class="review-course-name">{{ form.course_name || 'ยังไม่ได้ระบุชื่อ' }}</h3>
                  <div class="review-meta">
                    <span class="meta-badge">
                      <i class="fas fa-calendar me-1"></i>{{ form.year || 'ยังไม่ได้เลือกปี' }}
                    </span>
                    <span class="meta-badge">
                      <i class="fas fa-signal me-1"></i>{{ getLevelLabel(selectedLevel) }}
                    </span>
                    <span class="meta-badge" :class="courseType">
                      <i :class="courseType === 'free' ? 'fas fa-gift' : 'fas fa-crown'" class="me-1"></i>
                      {{ courseType === 'free' ? 'ฟรี' : 'พรีเมียม' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="review-section">
                <h5 class="review-section-title">รายละเอียด</h5>
                <p class="review-text">{{ form.description || 'ไม่มีรายละเอียด' }}</p>
              </div>
              
              <div v-if="tags.length > 0" class="review-section">
                <h5 class="review-section-title">แท็ก</h5>
                <div class="review-tags">
                  <span v-for="(tag, index) in tags" :key="index" class="tag-badge-review">{{ tag }}</span>
                </div>
              </div>
            </div>
            
            <!-- Error Alert -->
            <div v-if="submitError" class="alert-modern error mt-4">
              <i class="fas fa-exclamation-circle me-2"></i>
              {{ submitError }}
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="step-navigation">
            <button 
              v-if="currentStep > 1" 
              type="button" 
              class="btn btn-outline-modern"
              @click="prevStep"
            >
              <i class="fas fa-arrow-left me-2"></i>ย้อนกลับ
            </button>
            <div class="flex-grow-1"></div>
            <button 
              v-if="currentStep < 3" 
              type="button" 
              class="btn btn-primary-modern"
              @click="nextStep"
            >
              ถัดไป<i class="fas fa-arrow-right ms-2"></i>
            </button>
            <button 
              v-else 
              type="button" 
              class="btn btn-success-modern"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin me-2"></i>กำลังสร้าง...
              </span>
              <span v-else>
                <i class="fas fa-check me-2"></i>สร้างคอร์ส
              </span>
            </button>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

// Layout components removed (global)
import { useCourseStore } from '../courses.store';

const router = useRouter();
const courseStore = useCourseStore();

// Sidebar state removed (global)

// Form state
const currentStep = ref(1);
const isSubmitting = ref(false);
const submitError = ref('');

const form = reactive({
  course_name: '',
  description: '',
  year: '' as number | string,
});

const errors = reactive({
  course_name: '',
  year: '',
});

// Step definitions
const steps = [
  { id: 1, title: 'ข้อมูลพื้นฐาน' },
  { id: 2, title: 'ตั้งค่า' },
  { id: 3, title: 'ตรวจสอบ' },
];

// Options
const currentYear = new Date().getFullYear();
const availableYears = computed(() => {
  const years = [];
  for (let i = currentYear + 1; i >= currentYear - 5; i--) {
    years.push(i);
  }
  return years;
});

const courseIcons = ['📚', '💻', '🎨', '🔬', '📊', '🏥', '🎯', '🚀', '💡', '🔧'];
const selectedIcon = ref('📚');

const difficultyLevels = [
  { value: 'beginner', label: 'เริ่มต้น', icon: 'fas fa-seedling' },
  { value: 'intermediate', label: 'ปานกลาง', icon: 'fas fa-fire' },
  { value: 'advanced', label: 'ขั้นสูง', icon: 'fas fa-rocket' },
];
const selectedLevel = ref('beginner');

const courseType = ref('free');

const tags = ref<string[]>([]);
const tagInput = ref('');

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag);
    tagInput.value = '';
  }
};

const removeTag = (index: number) => {
  tags.value.splice(index, 1);
};

const getLevelLabel = (value: string) => {
  return difficultyLevels.find(l => l.value === value)?.label || 'ไม่ระบุ';
};

// Validation
const validateStep1 = () => {
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

// Navigation
const nextStep = () => {
  if (currentStep.value === 1) {
    if (!validateStep1()) return;
  }
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Submit
const handleSubmit = async () => {
  isSubmitting.value = true;
  submitError.value = '';

  try {
    await courseStore.createCourse({
      course_name: form.course_name.trim(),
      description: form.description.trim() || undefined,
      year: Number(form.year),
    });
    
    // Navigate to management page on success
    router.push('/courses/manage');
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างคอร์ส กรุณาลองใหม่อีกครั้ง';
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

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: white;
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

/* Stepper */
.stepper-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}

.stepper {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  left: calc(50% + 30px);
  width: 60px;
  height: 2px;
  background: #e2e8f0;
}

.step-item.completed:not(:last-child)::after {
  background: #10b981;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.3s;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.step-item.completed .step-circle {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
}

.step-item.active .step-label,
.step-item.completed .step-label {
  color: #1e293b;
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
}

/* Icon Picker */
.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  width: 48px;
  height: 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #10b981;
  transform: scale(1.05);
}

.icon-option.selected {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

/* Level Selector */
.level-selector {
  display: flex;
  gap: 12px;
}

.level-option {
  flex: 1;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.level-option i {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #64748b;
}

.level-option span {
  font-weight: 600;
  color: #475569;
}

.level-option:hover {
  border-color: #10b981;
}

.level-option.selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.level-option.selected i,
.level-option.selected span {
  color: #10b981;
}

/* Type Cards */
.type-cards {
  display: flex;
  gap: 12px;
}

.type-card {
  flex: 1;
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.type-card i {
  display: block;
  font-size: 2rem;
  margin-bottom: 8px;
  color: #64748b;
}

.type-card span {
  font-weight: 600;
  color: #475569;
}

.type-card:hover {
  border-color: #10b981;
}

.type-card.selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.type-card.selected i,
.type-card.selected span {
  color: #10b981;
}

/* Tags Input */
.tags-input-wrapper {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag-remove {
  background: transparent;
  border: none;
  color: white;
  opacity: 0.7;
  cursor: pointer;
  padding: 0;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  min-width: 150px;
  padding: 6px;
}

/* Review Section */
.review-summary {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
}

.review-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.review-icon-large {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.review-course-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.review-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-badge {
  padding: 6px 14px;
  background: white;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.meta-badge.paid {
  background: #fef3c7;
  color: #d97706;
  border-color: #fde68a;
}

.review-section {
  margin-bottom: 20px;
}

.review-section:last-child {
  margin-bottom: 0;
}

.review-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.review-text {
  color: #475569;
  line-height: 1.6;
}

.review-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-badge-review {
  padding: 6px 14px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Alert */
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

  .stepper {
    gap: 20px;
  }

  .step-item:not(:last-child)::after {
    width: 20px;
    left: calc(50% + 25px);
  }

  .step-label {
    font-size: 0.75rem;
  }

  .level-selector,
  .type-cards {
    flex-direction: column;
  }

  .review-card {
    flex-direction: column;
    text-align: center;
  }

  .review-meta {
    justify-content: center;
  }
}
</style>
