<template>
  <div class="courses-detail-instructor">
    <div class="content-wrapper">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
          <p>กำลังโหลดข้อมูลคอร์ส...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="text-center py-5">
          <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
          <h5>เกิดข้อผิดพลาด</h5>
          <p class="text-muted">{{ loadError }}</p>
          <button class="btn btn-primary-modern" @click="handleBack">
            <i class="fas fa-arrow-left me-2"></i>กลับ
          </button>
        </div>

        <!-- Main Content -->
        <template v-else>
          <div class="page-header-modern mb-4">
            <div class="header-content d-flex align-items-center justify-content-between">
              <div class="header-text">
                <button class="btn btn-outline-emerald btn-sm mb-3" @click="handleBack">
                  <i class="fas fa-arrow-left me-2"></i>กลับ
                </button>
                <h1 class="page-title-modern">
                  <i class="fas fa-edit me-2"></i>จัดการคอร์ส: {{ form.course_name }}
                </h1>
                <p class="page-subtitle-modern">จัดการข้อมูลพื้นฐาน, ผู้สอน และเวอร์ชันของคอร์ส</p>
              </div>
              <div class="header-actions">
                <!-- Success message -->
                <span v-if="saveSuccess" class="text-success me-3">
                  <i class="fas fa-check-circle me-1"></i>บันทึกสำเร็จ
                </span>
                <button class="btn btn-outline-secondary me-2" @click="handleBack">ยกเลิก</button>
                <button class="btn btn-header-primary" :disabled="isSaving" @click="handleSave">
                  <i v-if="isSaving" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="tab-navigation mb-4">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              <i class="fas fa-info-circle me-2"></i>ข้อมูลพื้นฐาน
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'lessons' }"
              @click="activeTab = 'lessons'"
            >
              <i class="fas fa-book me-2"></i>จัดการบทเรียน
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'versions' }"
              @click="activeTab = 'versions'"
            >
              <i class="fas fa-code-branch me-2"></i>ประวัติเวอร์ชัน
            </button>
          </div>

          <!-- Tab Content: Info -->
          <div v-show="activeTab === 'info'" class="tab-pane">
          <div class="row g-4 mt-2">
              <!-- Main Form -->
              <div class="col-lg-8">
                <div class="content-card-modern mb-4">
                  <h5 class="fw-bold mb-4">ข้อมูลพื้นฐาน</h5>
                  <div class="row g-3">
                    <div class="col-md-9">
                      <label class="form-label-modern">ชื่อคอร์ส *</label>
                      <input type="text" v-model="form.course_name" class="form-input-modern" :disabled="!isAdmin">
                    </div>
                    <div class="col-md-3">
                      <label class="form-label-modern">รุ่นปี *</label>
                      <input type="number" v-model="form.year" class="form-input-modern" :disabled="!isAdmin">
                    </div>
                    <div class="col-md-8">
                      <label class="form-label-modern">รหัสคอร์ส</label>
                      <div class="d-flex align-items-center gap-2">
                          <input type="text" v-model="form.code" class="form-input-modern" readonly disabled>
                          <span class="text-muted small">ID: #{{ currentCourse?.course_id }}</span>
                      </div>
                    </div>
                    </div>
                  </div>

                <!-- Instructor Section -->
                <div class="content-card-modern mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold mb-0">จัดการผู้สอน ({{ localInstructors.length }})</h5>
                    <button v-if="isAdmin" class="btn btn-emerald-sm" @click="showAddInstructorModal = true">
                      <i class="fas fa-plus me-2"></i>เพิ่มผู้สอน
                    </button>
                  </div>
                  <div v-if="instructorsLoading" class="text-center py-3">
                    <i class="fas fa-spinner fa-spin"></i> กำลังโหลด...
                  </div>
                  <div v-else class="instructor-list">
                    <div v-for="inst in localInstructors" :key="inst.user_id" class="instructor-item-modern">
                      <div class="d-flex align-items-center gap-3">
                        <div class="inst-avatar-modern">{{ getInitials(inst) }}</div>
                        <div>
                          <h6 class="mb-0 fw-bold">{{ getFullName(inst) }}</h6>
                          <span class="text-muted small">{{ inst.email }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-3">
                        <span class="badge-role-modern lead">Instructor</span>
                        <button v-if="isAdmin" class="btn btn-icon-danger" @click="handleRemoveInstructor(inst.user_id)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div v-if="localInstructors.length === 0" class="text-center py-3 text-muted">
                      <i class="fas fa-user-slash me-2"></i>ยังไม่มีผู้สอน (บันทึกเพื่อยืนยันการเปลี่ยนแปลง)
                    </div>
                  </div>
                </div>

                <!-- Versions Section -->
                <VersionManager 
                  v-if="currentCourse"
                  :course-id="currentCourse.course_id"
                  :active-version-id="currentCourse.active_published_version_id"
                  @edit-draft="handleEditDraft"
                  @version-changed="refreshCourse"
                  class="content-card-modern mb-4"
                />
              </div> <!-- End col-lg-8 -->

            <!-- Sidebar Actions -->
            <div class="col-lg-4">
              <div class="info-sidebar-card mb-4" v-if="isAdmin">
                <h5 class="fw-bold mb-4">รูปปกคอร์ส</h5>
                <div class="course-cover-preview mb-3" @click="triggerFileInput">
                  <img v-if="coverImagePreview" :src="coverImagePreview" class="img-fluid rounded" alt="Cover Preview" style="max-height: 180px; object-fit: cover; width: 100%;">
                  <div v-else class="empty-cover">
                    <i class="fas fa-image fa-2x text-muted"></i>
                    <span class="text-muted small mt-2">คลิกเพื่ออัปโหลดรูป</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref="coverImageInput" 
                  @change="handleCoverImageChange" 
                  accept="image/*" 
                  style="display: none;"
                >
                <button class="btn btn-outline-emerald w-100" @click="triggerFileInput">
                  <i class="fas fa-upload me-2"></i>
                  {{ pendingCoverFile ? 'รูปใหม่ (กดบันทึกเพื่ออัปโหลด)' : 'เลือกรูปปก' }}
                </button>
              </div>
            </div>
          </div>
          </div> <!-- End Info Tab -->

          <!-- Tab Content: Lessons -->
          <div v-show="activeTab === 'lessons'" class="tab-pane">
             <div id="lesson-builder-section" class="content-card-modern">
              <transition name="fade" mode="out-in">
                <!-- Lesson Content Editor (Full View) -->
                <LessonContentEditor
                  v-if="editingLessonContent"
                  :lesson-id="editingLessonContent.lesson_id"
                  :lesson-title="editingLessonContent.lesson_title"
                  @close="closeContentEditor"
                />

                <!-- Split View: Builder & Assignments -->
                <div v-else-if="currentCourse && draftVersionId">
                  <!-- TOP: Lesson Builder -->
                   <LessonBuilder
                    :course-id="currentCourse.course_id"
                    :version-id="draftVersionId"
                    :can-edit="true"
                    :selected-lesson-id="managingAssignmentsFor?.lesson_id"
                    @manage-content="openContentEditor"
                    @manage-assignments="openAssignmentManager"
                    @select-lesson="(l) => managingAssignmentsFor = l"
                  />
                  
                  <!-- Divider -->
                  <hr class="my-4 border-dashed">

                  <!-- BOTTOM: Assignments -->
                  <div class="assignment-section" id="assignment-section">
                    <div v-if="managingAssignmentsFor">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0 text-primary">
                                <i class="fas fa-tasks me-2"></i>แบบฝึกหัด: {{ managingAssignmentsFor.lesson_title }}
                            </h5>
                            <!-- Logic moved inside AssignmentList or keep here? AssignmentList handles create button if isInstructor -->
                        </div>
                        
                        <AssignmentList 
                            :assignments="filteredAssignments"
                            :loading="assignmentsStore.loading"
                            :is-instructor="true"
                            @create="openAssignmentEditor()"
                            @edit="openAssignmentEditor"
                            @delete="handleDeleteAssignment"
                            @select="handleViewSubmissions"
                            @view-submissions="handleViewSubmissions"
                        />
                    </div>
                    
                    <div v-else class="text-center py-5 text-muted bg-light rounded-3">
                        <i class="fas fa-arrow-up mb-2"></i>
                        <p>เลือกบทเรียนด้านบนเพื่อจัดการแบบฝึกหัด</p>
                    </div>
                  </div>
                </div>

                <!-- No Draft Message -->
                <div v-else class="text-center py-5">
                  <i class="fas fa-exclamation-circle fa-3x text-warning mb-3"></i>
                  <h5>ยังไม่มี Draft Version</h5>
                  <p class="text-muted">ไปที่แท็บ "ประวัติเวอร์ชัน" เพื่อสร้าง Draft ก่อนเพิ่มบทเรียน</p>
                  <button class="btn btn-outline-emerald" @click="activeTab = 'versions'">
                    <i class="fas fa-code-branch me-2"></i>ไปที่ประวัติเวอร์ชัน
                  </button>
                </div>
              </transition>
            </div>
          </div> <!-- End Lessons Tab -->

          <!-- Tab Content: Versions -->
          <div v-show="activeTab === 'versions'" class="tab-pane">
            <VersionManager 
              v-if="currentCourse"
              :course-id="currentCourse.course_id"
              :active-version-id="currentCourse.active_published_version_id"
              @edit-draft="handleEditDraft"
              @version-changed="refreshCourse"
              class="content-card-modern"
            />
          </div> <!-- End Versions Tab -->

        </template>
      </div>
    </div>

    <!-- Add Instructor Modal -->
    <div v-if="showAddInstructorModal" class="modal-backdrop-modern">
      <div class="modal-dialog-modern">
        <div class="modal-content-modern">
          <div class="modal-header-modern">
            <h5 class="modal-title fw-bold">เพิ่มผู้สอน</h5>
            <button class="btn-close-modern" @click="showAddInstructorModal = false"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body-modern">
            <div class="search-box mb-3">
              <i class="fas fa-search search-icon text-muted"></i>
              <input 
                type="text" 
                class="form-control" 
                placeholder="ค้นหาด้วยชื่อ หรืออีเมล..." 
                v-model="searchQuery"
                style="padding-left: 2.5rem;"
              >
            </div>
            
            <div class="user-list-container">
              <div v-if="isSearching" class="text-center py-3">
                <i class="fas fa-spinner fa-spin text-emerald-500"></i>
              </div>
              <div v-else-if="filteredUsers.length > 0" class="user-list">
                <div v-for="user in filteredUsers" :key="user.user_id" class="user-item" @click="handleAddInstructor(user)">
                  <div class="user-avatar">{{ getInitials(user) }}</div>
                  <div class="user-info">
                    <div class="user-name">{{ getFullName(user) }}</div>
                    <div class="user-email sub-text">{{ user.email }}</div>
                  </div>
                  <i class="fas fa-plus-circle text-emerald-500 fa-lg" v-if="!isUserInstructor(user.user_id)"></i>
                  <span class="badge bg-secondary" v-else>เป็นผู้สอนแล้ว</span>
                </div>
              </div>
              <div v-else class="text-center py-4 text-muted">
                ไม่พบผู้ใช้งาน
              </div>
            </div>
          </div>
        </div>
    </div>
    <AssignmentEditor ref="assignmentEditorRef" @saved="handleAssignmentSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import client from '../../../core/api/client';
import { usePermissions } from '../../../core/permissions/permissions';
import { useCourseStore } from '../courses.store';
import { useCourseVersionsStore } from '../courseVersions.store';
import { useCourseInstructorsStore } from '../courseInstructors.store';
import VersionManager from '../components/VersionManager.vue';
import LessonBuilder from '../components/LessonBuilder.vue';
import LessonContentEditor from '../components/LessonContentEditor.vue';
import AssignmentList from '../../assignments/pages/AssignmentList.vue';
import AssignmentEditor from '../../assignments/components/AssignmentEditor.vue';
import { useAssignmentsStore } from '../../assignments/assignments.store';
import { usersApi, type User } from '../../users/users.api';
import { type Lesson } from '../lessons.api';
import { type Assignment } from '../../assignments/assignments.api';
import { watch } from 'vue';
import { showDeleteConfirm } from '@/core/utils/swal';
import { getImageUrl } from '@/core/utils/image.helper';

const router = useRouter();
const route = useRoute();
const courseStore = useCourseStore();
const versionsStore = useCourseVersionsStore();
const instructorsStore = useCourseInstructorsStore();
const assignmentsStore = useAssignmentsStore();
const { isAdmin } = usePermissions();

// Layout state
// Layout state removed (global)
const showAddInstructorModal = ref(false);

const handleBack = () => {
    router.back();
};

// Loading states
const isLoading = ref(true);
const loadError = ref('');
const isSaving = ref(false);
const saveSuccess = ref(false);
const activeTab = ref<'info' | 'lessons' | 'versions'>('info');

// Form data from store
const form = reactive({
    course_name: '',
    description: '',
    year: '' as number | string,
    code: '',
});

// Load course data on mount
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
            form.course_name = course.course_name;
            form.description = course.description || '';
            form.year = course.year || new Date().getFullYear();
            form.code = `COURSE${course.course_id}`;
            // Fetch instructors and versions
            await instructorsStore.fetchInstructors(course.course_id);
            await versionsStore.fetchVersions(course.course_id);
            // Auto-fetch assignments for badge display
            await assignmentsStore.fetchPublishedAssignments(course.course_id);
        } else {
            loadError.value = 'ไม่พบคอร์สที่ต้องการ';
        }
    } catch (err: any) {
        loadError.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    } finally {
        isLoading.value = false;
    }
});

const currentCourse = computed(() => courseStore.currentCourse);
const draftVersionId = computed(() => {
    const draft = versionsStore.versions.find(v => v.status === 'Draft');
    return draft?.version_id || null;
});

const handleEditDraft = (_version: any) => {
    const element = document.getElementById('lesson-builder-section');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

const refreshCourse = async () => {
    if (currentCourse.value) {
        await courseStore.fetchCourseById(currentCourse.value.course_id);
        await versionsStore.fetchVersions(currentCourse.value.course_id);
    }
};

// Lesson Content Editor State
const editingLessonContent = ref<Lesson | null>(null);

const openContentEditor = (lesson: Lesson) => {
    editingLessonContent.value = lesson;
    // Scroll slightly to header
    setTimeout(() => {
        const el = document.getElementById('lesson-builder-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
};

const closeContentEditor = () => {
    editingLessonContent.value = null;
    const el = document.getElementById('lesson-builder-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Assignment Management
const managingAssignmentsFor = ref<Lesson | null>(null);
const assignmentEditorRef = ref<any>(null);

const openAssignmentManager = async (lesson: Lesson) => {
    managingAssignmentsFor.value = lesson;
    // Assignments are scoped per lesson in this view, but my store lists by course?
    // Wait, let's check API. listPublishedAssignments(courseId).
    // The store should probably have a fetch by lesson if that exists?
    // Backend has GET /lessons/:lessonId/assignments
    
    // I should probably add fetchByLesson to the store/API.
    // For now, let's assume we can filter or better, I should add the API call.
    if (currentCourse.value) {
        await assignmentsStore.fetchPublishedAssignments(currentCourse.value.course_id);
    }
    
    setTimeout(() => {
        const el = document.getElementById('lesson-builder-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
};

const filteredAssignments = computed(() => {
    if (!managingAssignmentsFor.value) return [];
    return assignmentsStore.assignments.filter(a => a.lesson_id === managingAssignmentsFor.value?.lesson_id);
});

const openAssignmentEditor = (assignment?: Assignment) => {
    console.log("openAssignmentEditor called", { 
        assignment, 
        managing: managingAssignmentsFor.value,
        ref: assignmentEditorRef.value 
    });
    if (!managingAssignmentsFor.value) {
        console.warn("No lesson selected for assignment management");
        return;
    }
    if (!assignmentEditorRef.value) {
        console.error("AssignmentEditor ref is missing!");
        return;
    }
    assignmentEditorRef.value?.open(managingAssignmentsFor.value.lesson_id, assignment);
};

const handleAssignmentSaved = () => {
    if (currentCourse.value) assignmentsStore.fetchPublishedAssignments(currentCourse.value.course_id);
};

const handleDeleteAssignment = async (id: number) => {
    const result = await showDeleteConfirm('แบบฝึกหัดนี้');
    if (result.isConfirmed) {
        await assignmentsStore.deleteAssignment(id);
    }
};

const handleViewSubmissions = (assignment: Assignment) => {
    router.push(`/grading/assignment/${assignment.assignment_id}`);
};

// Save handler
const handleSave = async () => {
    if (!currentCourse.value) return;
    
    isSaving.value = true;
    saveSuccess.value = false;
    
    try {
        // Upload cover image if pending
        if (pendingCoverFile.value) {
            await uploadCoverImage();
        }
        
        // Parallel update: Course details (Admin only) AND Instructors (Admin only)
        const updates = [];

        // Only Admin can update basic course info
        if (isAdmin.value) {
            updates.push(courseStore.updateCourse(currentCourse.value.course_id, {
                course_name: form.course_name.trim(),
                description: form.description.trim() || undefined,
                year: Number(form.year),
            }));
        }

        // Only Admin can sync instructors (Already guarded by UI, but good to be safe)
        if (isAdmin.value && localInstructors.value) {
             updates.push(instructorsStore.syncInstructors(currentCourse.value.course_id, localInstructors.value));
        }

        if (updates.length > 0) {
            await Promise.all(updates);
        }

        saveSuccess.value = true;
        setTimeout(() => {
            saveSuccess.value = false;
        }, 3000);
    } catch (err: any) {
        alert(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
        isSaving.value = false;
    }
};

// Cover Image Upload
const coverImageInput = ref<HTMLInputElement | null>(null);
const coverImagePreview = ref<string | null>(null);
const pendingCoverFile = ref<File | null>(null);

// Initialize cover image preview from current course
watch(currentCourse, (course) => {
    if (course?.cover_image_url) {
        coverImagePreview.value = getImageUrl(course.cover_image_url);
    }
}, { immediate: true });

const triggerFileInput = () => {
    coverImageInput.value?.click();
};

// Only preview locally, actual upload happens on Save
const handleCoverImageChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Store file for later upload
    pendingCoverFile.value = file;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        coverImagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
};

// Upload cover image to server (called during Save)
const uploadCoverImage = async () => {
    if (!pendingCoverFile.value || !currentCourse.value) return;
    
    const formData = new FormData();
    formData.append('cover_image', pendingCoverFile.value);
    
    // Use client to ensure auth headers are attached
    await client.post(`/courses/${currentCourse.value.course_id}/cover`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    // Clear pending file after successful upload
    pendingCoverFile.value = null;
};

// Instructors
// Instructors Local State
const localInstructors = ref<any[]>([]);
// const instructors = computed(() => instructorsStore.instructors); // No longer direct map
const instructorsLoading = computed(() => instructorsStore.loading);

// Sync local state when store loads
watch(() => instructorsStore.instructors, (submit) => {
    if (submit) {
        // Clone deep or spread to avoid reactive binding issues during edit
        localInstructors.value = [...submit];
    }
}, { immediate: true });

const getInitials = (inst: any) => {
    const first = inst.first_name?.[0] || '';
    const last = inst.last_name?.[0] || '';
    const initials = (first + last).toUpperCase();
    if (initials) return initials;
    if (inst.email?.[0]) return inst.email[0].toUpperCase();
    if (inst.user_id) return 'ID' + inst.user_id;
    return '?';
};

const getFullName = (inst: any) => {
    if (inst.first_name || inst.last_name) {
        return `${inst.first_name || ''} ${inst.last_name || ''}`.trim();
    }
    return inst.email || `Instructor #${inst.user_id || inst.instructor_id || '?'}`;
};

const handleRemoveInstructor = async (userId: number) => {
   // Local delete
   localInstructors.value = localInstructors.value.filter(i => i.user_id !== userId);
};

// Add Instructor Modal Logic
const searchQuery = ref('');
const allUsers = ref<User[]>([]);
const isSearching = ref(false);

watch(showAddInstructorModal, async (newVal) => {
    if (newVal && allUsers.value.length === 0) {
        isSearching.value = true;
        try {
            allUsers.value = await usersApi.getAllUsers();
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            isSearching.value = false;
        }
    }
});

const filteredUsers = computed(() => {
    if (!searchQuery.value) return allUsers.value.slice(0, 10);
    const query = searchQuery.value.toLowerCase();
    return allUsers.value.filter(u => 
        u.first_name?.toLowerCase().includes(query) || 
        u.last_name?.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    ).slice(0, 50);
});

const isUserInstructor = (userId: number) => {
    return (localInstructors.value || []).some(inst => Number(inst.user_id) === Number(userId));
};

const handleAddInstructor = async (user: User) => {
    if (isUserInstructor(user.user_id)) return;
    
    // Add to local list
    localInstructors.value.push({
        user_id: user.user_id,
        instructor_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: 'owner', // Default role
        assigned_at: new Date().toISOString()
    });
    
    showAddInstructorModal.value = false;
};


</script>

<style scoped>
.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.btn-emerald-sm {
  background: #f0fdf4;
  color: #10b981;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-emerald-sm:hover {
  background: #dcfce7;
  color: #059669;
}

.form-label-modern {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.form-input-modern, .form-select-modern {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input-modern:focus, .form-select-modern:focus {
  border-color: #10b981;
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.instructor-item-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 15px;
  margin-bottom: 10px;
}


.modal-backdrop-modern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
}
.modal-dialog-modern {
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}
.modal-header-modern {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-body-modern {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}
.btn-close-modern {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #64748b;
}
.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
}
.search-box {
    position: relative;
}
.user-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 8px;
}
.user-item:hover {
  background-color: #f1f5f9;
}
.user-avatar {
  width: 40px;
  height: 40px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
  color: #64748b;
}
.user-info {
  flex: 1;
}
.user-name {
  font-weight: 600;
  color: #1e293b;
}
.user-email {
  font-size: 0.85rem;
  color: #64748b;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.inst-avatar-modern {
  width: 40px;
  height: 40px;
  background: #10b981;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.badge-role-modern {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-role-modern.lead { background: #dcfce7; color: #10b981; }
.badge-role-modern.assistant { background: #eff6ff; color: #3b82f6; }

.version-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.version-card-modern {
  background: #f8fafc;
  border-radius: 15px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.version-card-modern.current {
  border-color: #10b981;
  background: #f0fdf4;
}

.version-tag {
  font-weight: 700;
  color: #1e293b;
}

.current-indicator {
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
}

.version-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.course-cover-preview {
  height: 180px;
  background: #f1f5f9;
  border-radius: 15px;
  border: 2px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 8px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 16px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.tab-btn.active {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.tab-pane {
  animation: fadeIn 0.2s ease-out;
}
</style>
