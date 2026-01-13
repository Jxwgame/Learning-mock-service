<template>
  <div class="user-detail-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูลผู้ใช้...</p>
      </div>

      <div v-else-if="user" class="content-wrapper">
        <!-- Header with Back Button -->
        <div class="page-header-modern mb-4">
          <div class="header-content d-flex align-items-center gap-3">
            <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/users')">
              <i class="fas fa-arrow-left"></i>
            </button>
            <div class="header-text">
              <h1 class="page-title-modern">
                {{ user.first_name }} {{ user.last_name }}
              </h1>
              <p class="page-subtitle-modern">{{ user.email }}</p>
            </div>
            <div class="ms-auto d-flex gap-2">
               <span :class="['badge-status', user.is_active ? 'active' : 'inactive']">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
               </span>
            </div>
          </div>
        </div>

        <!-- Custom Tabs -->
        <div class="modern-tabs mb-4">
          <div 
             class="tab-item" 
             :class="{ active: activeTab === 'overview' }"
             @click="activeTab = 'overview'"
          >
             <i class="fas fa-user-circle me-2"></i>ข้อมูลทั่วไป
          </div>
          <div 
             class="tab-item" 
             :class="{ active: activeTab === 'security' }"
             @click="activeTab = 'security'; loadSessions(); loadDirectPermissions()"
          >
             <i class="fas fa-shield-alt me-2"></i>ความปลอดภัย & สิทธิ์
          </div>
        </div>

        <div v-if="activeTab === 'overview'" class="tab-content-fade">
          <div class="row g-4">
            <div class="col-md-5">
              <div class="section-card h-100">
                <div class="section-header">
                  <div class="section-title">
                    <div class="section-icon emerald">
                      <i class="fas fa-id-card"></i>
                    </div>
                    <span>ข้อมูลส่วนตัว</span>
                  </div>
                </div>
                <div class="card-body p-4">
                  <div class="user-avatar-large mx-auto mb-4" :style="avatarStyle">
                    {{ userInitials }}
                  </div>
                  
                  <div class="info-list">
                    <div class="info-item mb-3">
                      <label class="text-muted small">User ID</label>
                      <div class="fw-bold">#{{ user.user_id }}</div>
                    </div>
                    <div class="info-item mb-3">
                      <label class="text-muted small">ชื่อ-นามสกุล</label>
                      <div class="fw-bold">{{ user.first_name }} {{ user.last_name }}</div>
                    </div>
                    <div class="info-item mb-3">
                      <label class="text-muted small">Email</label>
                      <div class="fw-bold">{{ user.email }}</div>
                    </div>
                    <div class="info-item mb-3">
                      <label class="text-muted small">วันที่สมัคร</label>
                      <div class="fw-bold">{{ formatDate(user.created_at) }}</div>
                    </div>
                  </div>
                  
                  <div class="d-grid mt-4">
                    <button class="btn btn-primary" disabled>
                        <i class="fas fa-edit me-2"></i>แก้ไขข้อมูล
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'security'" class="tab-content-fade">
          <!-- Role Management - Full Width -->
          <div class="section-card mb-4">
            <div class="section-header">
              <div class="section-title">
                <div class="section-icon cyan">
                  <i class="fas fa-user-tag"></i>
                </div>
                <span>จัดการ Role</span>
              </div>
              <div class="d-flex gap-2 align-items-center">
                <select v-model="selectedRoleId" class="form-select form-select-sm role-select">
                  <option value="">เลือก Role เพื่อเพิ่ม...</option>
                  <option v-for="role in filteredRoles" :key="role.role_id" :value="role.role_id">
                    {{ role.role_name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="card-body p-4">
              <div v-if="!user.roles || user.roles.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-user-slash fa-2x mb-2 opacity-50"></i>
                <p class="mb-0">ยังไม่มี Role ที่กำหนด</p>
              </div>
              <div v-else class="role-cards-grid">
                <div 
                  v-for="role in user.roles" 
                  :key="role" 
                  class="role-card"
                  :class="getRoleClass(role)"
                >
                  <div class="role-card-icon">
                    <i :class="getRoleIcon(role)"></i>
                  </div>
                  <div class="role-card-content">
                    <div class="role-card-name">{{ role }}</div>
                    <div class="role-card-desc">{{ getRoleDescription(role) }}</div>
                  </div>
                  <button class="role-card-remove" @click="handleRevokeRole(role)" title="ยึด Role">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Direct Permissions -->
            <div class="col-md-6">
              <div class="section-card h-100">
                <div class="section-header">
                  <div class="section-title">
                    <div class="section-icon purple">
                      <i class="fas fa-key"></i>
                    </div>
                    <span>Permission รายบุคคล</span>
                  </div>
                  <button class="btn btn-primary btn-sm" @click="openPermissionsModal">
                    <i class="fas fa-cog me-1"></i>จัดการ
                  </button>
                </div>
                <div class="card-body p-4">
                  <div v-if="permissionsLoading" class="text-muted small text-center py-2">
                    <i class="fas fa-spinner fa-spin me-1"></i>กำลังโหลด...
                  </div>
                  <div v-else-if="directPermissions.length === 0" class="text-muted small">
                    <i class="fas fa-info-circle me-1"></i>
                    ยังไม่มี Permission รายบุคคลที่กำหนด
                  </div>
                  <div v-else class="permission-badges">
                    <span 
                      v-for="perm in directPermissions" 
                      :key="perm.permission_id"
                      class="permission-badge"
                      :class="{ 'revoked': perm.is_revoked }"
                      :title="perm.is_revoked ? 'ถูกยึด' : 'มอบให้'"
                    >
                      <i :class="perm.is_revoked ? 'fas fa-ban' : 'fas fa-check-circle'"></i>
                      {{ perm.permission_name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Sessions -->
            <div class="col-md-6">
              <div class="section-card h-100">
                <div class="section-header">
                  <div class="section-title">
                    <div class="section-icon blue">
                      <i class="fas fa-desktop"></i>
                    </div>
                    <span>Active Sessions</span>
                  </div>
                  <button class="btn btn-sm btn-outline-primary" @click="loadSessions">
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': sessionLoading }"></i>
                  </button>
                </div>
                <div class="card-body p-0">
                  <div v-if="sessionLoading" class="p-4 text-center text-muted">
                    กำลังโหลด...
                  </div>
                  <div v-else-if="userSessions.length === 0" class="p-4 text-center text-muted">
                    <i class="fas fa-check-circle text-success me-1"></i>
                    ไม่พบ Session ที่ใช้งานอยู่
                  </div>
                  <div v-else class="sessions-list">
                    <div v-for="session in userSessions" :key="session.session_id" class="session-item">
                      <div class="session-icon-wrapper">
                        <i :class="getDeviceIcon(session)"></i>
                      </div>
                      <div class="session-info">
                        <div class="fw-bold small">{{ session.user_agent || 'Unknown Device' }}</div>
                        <div class="small text-muted">{{ session.ip_address }} • {{ formatDate(session.created_at) }}</div>
                      </div>
                      <button class="btn btn-sm btn-danger-soft" @click="handleRevokeSession(session.session_id)">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
       
      <div v-else class="error-state text-center mt-5">
         <h3>User not found</h3>
         <button class="btn btn-primary mt-3" @click="$router.push('/users')">Back to Users</button>
      </div>

      <!-- Permissions Modal -->
      <UserPermissionsModal 
        v-if="user"
        ref="permissionsModalRef"
        :user-id="userId"
        :user-name="user.first_name + ' ' + user.last_name"
        @updated="fetchUser"
      />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import UserPermissionsModal from '../components/UserPermissionsModal.vue';
import { adminApi, type User, type Role, type Session } from '../admin.api';
import { showConfirm } from '@/core/utils/swal';

// State
const route = useRoute();
const userId = Number(route.params.userId);

const loading = ref(true);
const user = ref<User | null>(null);
const activeTab = ref<'overview' | 'security'>('overview');

// Security State
const availableRoles = ref<Role[]>([]);
const userSessions = ref<Session[]>([]);
const sessionLoading = ref(false);
const selectedRoleId = ref<number | ''>('');

// Direct Permissions State
import type { DirectUserPermission } from '../admin.api';
const directPermissions = ref<DirectUserPermission[]>([]);
const permissionsLoading = ref(false);

// Permissions Modal
const permissionsModalRef = ref<InstanceType<typeof UserPermissionsModal> | null>(null);

const openPermissionsModal = () => {
  permissionsModalRef.value?.open();
};

// Load Direct Permissions
const loadDirectPermissions = async () => {
  if (!userId) return;
  permissionsLoading.value = true;
  try {
    directPermissions.value = await adminApi.getUserDirectPermissions(userId);
  } catch (error) {
    console.error('Failed to load direct permissions:', error);
  } finally {
    permissionsLoading.value = false;
  }
};

// Format Date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDeviceIcon = (session: Session) => {
  const ua = session.user_agent?.toLowerCase() || '';
  if (ua.includes('mobile')) return 'fas fa-mobile-alt';
  if (ua.includes('pad') || ua.includes('tablet')) return 'fas fa-tablet-alt';
  return 'fas fa-laptop';
};

// Data Fetching
const fetchUser = async () => {
   if (!userId) return;
   loading.value = true;
   try {
      const [userData, rolesData] = await Promise.all([
         adminApi.getUserById(userId),
         adminApi.getRoles()
      ]);
      user.value = userData;
      availableRoles.value = rolesData;
      
      // Load sessions and permissions if on security tab
      if (activeTab.value === 'security') {
         await Promise.all([loadSessions(), loadDirectPermissions()]);
      }
   } catch (error) {
      console.error('Failed to fetch user data:', error);
   } finally {
      loading.value = false;
   }
};

const loadSessions = async () => {
   if (!userId) return;
   sessionLoading.value = true;
   try {
      userSessions.value = await adminApi.getSessions(userId);
   } catch (error) {
      console.error('Failed to load sessions:', error);
   } finally {
      sessionLoading.value = false;
   }
};

const handleRevokeRole = async (roleName: string) => {
   const role = availableRoles.value.find(r => r.role_name === roleName);
   if (!role) return;
   
   const result = await showConfirm(`ยืนยันยึด Role "${roleName}" ออก?`);
   if (!result.isConfirmed) return;

   try {
      await adminApi.revokeRole(userId, role.role_id);
      await fetchUser();
   } catch (error) {
      console.error('Failed to revoke role:', error);
      alert('Failed to revoke role');
   }
};

const handleRevokeSession = async (sessionId: string) => {
   const result = await showConfirm('ยืนยัน force logout session นี้?');
   if (!result.isConfirmed) return;
   try {
      await adminApi.revokeSession(sessionId);
      await loadSessions();
   } catch (error) {
      console.error('Failed to revoke session:', error);
      alert('Failed to revoke session');
   }
};

// Computed
const userInitials = computed(() => {
  if (!user.value) return '?';
  const first = user.value.first_name?.[0] || '';
  const last = user.value.last_name?.[0] || '';
  return (first + last).toUpperCase() || '?';
});

const avatarStyle = computed(() => {
   const colors = ['#059669', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];
   const color = colors[(user.value?.user_id || 0) % colors.length];
   return { backgroundColor: color };
});

const filteredRoles = computed(() => {
   // Roles that user doesn't have yet
   return availableRoles.value.filter(role => !user.value?.roles.includes(role.role_name));
});

// Role display helpers
const getRoleClass = (role: string) => {
  const lower = role.toLowerCase();
  if (lower.includes('super') || lower.includes('admin')) return 'role-admin';
  if (lower.includes('instructor') || lower.includes('teacher')) return 'role-instructor';
  return 'role-learner';
};

const getRoleIcon = (role: string) => {
  const lower = role.toLowerCase();
  if (lower.includes('super') || lower.includes('admin')) return 'fas fa-crown';
  if (lower.includes('instructor') || lower.includes('teacher')) return 'fas fa-chalkboard-teacher';
  return 'fas fa-user-graduate';
};

const getRoleDescription = (role: string) => {
  const lower = role.toLowerCase();
  if (lower.includes('super_admin')) return 'เข้าถึงระบบได้ทั้งหมด';
  if (lower.includes('admin')) return 'จัดการระบบและผู้ใช้';
  if (lower.includes('instructor') || lower.includes('teacher')) return 'สร้างและจัดการคอร์ส';
  if (lower.includes('learner') || lower.includes('student')) return 'เข้าเรียนคอร์ส';
  return 'สิทธิ์ตามที่กำหนด';
};

onMounted(() => {
   fetchUser();
});
</script>

<style scoped>
@import url('../../../style.css');

.backoffice-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-surface-2);
}

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header - Green Gradient */
.page-header-modern {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 24px 30px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

.page-title-modern {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.page-subtitle-modern {
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-size: 0.9rem;
}

.page-header-modern .btn-outline-secondary {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.page-header-modern .btn-outline-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
}

.page-header-modern .badge-status {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Role Cards */
.role-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: white;
  transition: all 0.2s ease;
  position: relative;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.role-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin-right: 16px;
  flex-shrink: 0;
}

.role-card-content {
  flex: 1;
  min-width: 0;
}

.role-card-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 2px;
}

.role-card-desc {
  font-size: 0.8rem;
  opacity: 0.7;
}

.role-card-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.role-card:hover .role-card-remove {
  opacity: 1;
}

.role-card-remove:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Role color variants */
.role-card.role-admin {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #d8b4fe;
}

.role-card.role-admin .role-card-icon {
  background: #7c3aed;
  color: white;
}

.role-card.role-admin .role-card-name {
  color: #6b21a8;
}

.role-card.role-instructor {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
}

.role-card.role-instructor .role-card-icon {
  background: #3b82f6;
  color: white;
}

.role-card.role-instructor .role-card-name {
  color: #1e40af;
}

.role-card.role-learner {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.role-card.role-learner .role-card-icon {
  background: #10b981;
  color: white;
}

.role-card.role-learner .role-card-name {
  color: #047857;
}

.role-select {
  min-width: 200px;
  border-radius: 8px;
}

/* Permission Badges */
.permission-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #047857;
  border: 1px solid #86efac;
  transition: all 0.2s;
}

.permission-badge i {
  font-size: 0.75rem;
}

.permission-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.permission-badge.revoked {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

.permission-badge.revoked:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}
.section-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
  height: 100%;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.section-icon.emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.section-icon.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
.section-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.section-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.user-avatar-large {
   width: 100px;
   height: 100px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 2.5rem;
   color: white;
   font-weight: bold;
}

/* Tabs */
.modern-tabs {
   display: flex;
   gap: 1rem;
   border-bottom: 1px solid var(--border-light);
   padding-bottom: 0.5rem;
}

.tab-item {
   padding: 0.75rem 1.5rem;
   border-radius: 8px;
   cursor: pointer;
   font-weight: 500;
   color: var(--text-secondary);
   transition: all 0.2s;
   display: flex;
   align-items: center;
}

.tab-item:hover {
   background: rgba(0,0,0,0.02);
   color: var(--primary-color);
}

.tab-item.active {
   background: var(--primary-light);
   color: var(--primary-dark);
   font-weight: 600;
}

.Badge-role-pill {
   display: inline-flex;
   align-items: center;
   background: #f1f5f9;
   color: #475569;
   padding: 0.5rem 1rem;
   border-radius: 50px;
   font-size: 0.9rem;
   font-weight: 500;
   border: 1px solid #e2e8f0;
}

.btn-role-remove {
   background: none;
   border: none;
   margin-left: 0.5rem;
   color: #94a3b8;
   cursor: pointer;
   padding: 2px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.2s;
}

.btn-role-remove:hover {
   background: #fee2e2;
   color: #ef4444;
}

/* Sessions */
.session-item {
   display: flex;
   align-items: center;
   padding: 1rem 1.5rem;
   border-bottom: 1px solid var(--border-light);
   transition: background 0.2s;
}

.session-item:last-child {
   border-bottom: none;
}

.session-item:hover {
   background: #f8fafc;
}

.session-icon-wrapper {
   width: 40px;
   height: 40px;
   border-radius: 10px;
   background: #f1f5f9;
   color: #64748b;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.2rem;
   margin-right: 1rem;
}

.session-info {
   flex: 1;
}

.btn-danger-soft {
   background: #fee2e2;
   color: #ef4444;
   border: none;
   padding: 0.4rem 0.8rem;
   border-radius: 6px;
   font-size: 0.85rem;
   font-weight: 500;
   transition: all 0.2s;
}

.btn-danger-soft:hover {
   background: #ef4444;
   color: white;
}

.badge-status.active {
   background-color: #d1fae5;
   color: #065f46;
   padding: 0.25rem 0.75rem;
   border-radius: 9999px;
   font-size: 0.875rem;
}

.badge-status.inactive {
   background-color: #fee2e2;
   color: #991b1b;
   padding: 0.25rem 0.75rem;
   border-radius: 9999px;
   font-size: 0.875rem;
}

.loading-container {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   height: 50vh;
   color: var(--text-secondary);
}

.spinner {
   width: 40px;
   height: 40px;
   border: 3px solid rgba(0,0,0,0.1);
   border-radius: 50%;
   border-top-color: var(--primary-color);
   animation: spin 1s linear infinite;
   margin-bottom: 1rem;
}

@keyframes spin {
   to { transform: rotate(360deg); }
}

.tab-content-fade {
   animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
   from { opacity: 0; transform: translateY(5px); }
   to { opacity: 1; transform: translateY(0); }
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.section-icon.emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.section-icon.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
.section-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

.user-avatar-large {
   width: 100px;
   height: 100px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 2.5rem;
   color: white;
   font-weight: bold;
}

.badge-status.active {
   background-color: #d1fae5;
   color: #065f46;
   padding: 0.25rem 0.75rem;
   border-radius: 9999px;
   font-size: 0.875rem;
}

.badge-status.inactive {
   background-color: #fee2e2;
   color: #991b1b;
   padding: 0.25rem 0.75rem;
   border-radius: 9999px;
   font-size: 0.875rem;
}

.loading-container {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   height: 50vh;
   color: var(--text-secondary);
}

.spinner {
   width: 40px;
   height: 40px;
   border: 3px solid rgba(0,0,0,0.1);
   border-radius: 50%;
   border-top-color: var(--primary-color);
   animation: spin 1s linear infinite;
   margin-bottom: 1rem;
}

@keyframes spin {
   to { transform: rotate(360deg); }
}
</style>
