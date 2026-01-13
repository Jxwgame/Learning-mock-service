<template>
  <div class="security-page">
    <div class="content-wrapper">
      <!-- Page Header -->
      <div class="page-header-modern">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title-modern">
              <i class="bi bi-shield-check me-2"></i>Security & Access Control
            </h1>
            <p class="page-subtitle-modern">จัดการ Sessions, Roles และ Permissions</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon emerald">
            <i class="bi bi-laptop"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ sessions.length }}</div>
            <div class="stat-label">Active Sessions</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan">
            <i class="bi bi-person-badge"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ roles.length }}</div>
            <div class="stat-label">Assigned Roles</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">
            <i class="bi bi-key"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ permissions.length }}</div>
            <div class="stat-label">Total Permissions</div>
          </div>
        </div>
      </div>

      <!-- Sessions Section -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-title">
            <div class="section-icon emerald">
              <i class="bi bi-laptop"></i>
            </div>
            <span>My Sessions / Security</span>
          </div>
          <button class="btn btn-danger-outline" @click="handleLogoutAll">
            <i class="bi bi-box-arrow-right me-2"></i>Logout All Sessions
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>กำลังโหลด...</span>
        </div>

        <div v-else class="sessions-list">
          <div v-for="session in sessions" :key="session.session_id" class="session-item">
            <div class="session-header">
              <div class="session-device">
                <i :class="getDeviceIcon(session)" class="device-icon"></i>
                <div>
                  <h5>{{ session.user_agent || session.device_id }}</h5>
                  <span v-if="session.is_current" class="badge-current">Current Session</span>
                </div>
              </div>
              <button 
                v-if="!session.is_current"
                class="btn btn-revoke" 
                @click="handleRevokeSession(session.session_id)"
              >
                <i class="bi bi-x-lg"></i> Revoke
              </button>
            </div>
            <div class="session-details">
              <div class="detail-item">
                <i class="bi bi-geo-alt"></i>
                <span>{{ session.ip_address }}</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-clock"></i>
                <span>{{ session.last_activity_at || '-' }}</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-calendar"></i>
                <span>{{ session.created_at }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Roles Section -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-title">
            <div class="section-icon cyan">
              <i class="bi bi-person-badge"></i>
            </div>
            <span>Role Management</span>
          </div>
        </div>
        
        <div class="roles-grid">
          <div v-for="role in roles" :key="role.role_id" class="role-card">
            <div class="role-header">
              <div class="role-icon">
                <i :class="getRoleIcon(role.role_name)"></i>
              </div>
              <div class="role-info">
                <h5>{{ role.role_name }}</h5>
                <p>{{ role.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions Section -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-title">
            <div class="section-icon blue">
              <i class="bi bi-key"></i>
            </div>
            <span>Permissions</span>
          </div>
          <button class="btn btn-add" @click="openPermissionModal()">
            <i class="bi bi-plus-lg me-2"></i>เพิ่ม Permission
          </button>
        </div>
        
        <div class="permissions-grid">
          <div v-for="perm in permissions" :key="perm.permission_id" class="permission-item">
            <div class="permission-icon">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="permission-info">
              <span class="permission-name">{{ perm.permission_name }}</span>
              <span class="permission-desc">{{ perm.description }}</span>
            </div>
            <div class="permission-actions">
              <button class="btn-icon-sm" title="แก้ไข" @click="openPermissionModal(perm)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn-icon-sm danger" title="ลบ" @click="handleDeletePermission(perm)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Permission Modal -->
      <div v-if="showPermissionModal" class="modal-overlay" @click.self="closePermissionModal">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h5><i class="bi bi-key me-2"></i>{{ editingPermission ? 'แก้ไข Permission' : 'เพิ่ม Permission ใหม่' }}</h5>
            <button class="btn-close" @click="closePermissionModal"></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>ชื่อ Permission <span class="required">*</span></label>
              <input v-model="permissionForm.permission_name" type="text" class="form-input" placeholder="e.g. user.create" />
            </div>
            <div class="form-group">
              <label>คำอธิบาย</label>
              <input v-model="permissionForm.description" type="text" class="form-input" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closePermissionModal">ยกเลิก</button>
            <button class="btn btn-primary" @click="handleSavePermission">
              <i class="bi bi-check-lg me-2"></i>บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  getSessions, getRoles, getPermissions, 
  revokeSession, revokeAllSessions,
  createPermission, updatePermission, deletePermission
} from '../admin.api';
import type { Session, Role, Permission } from '../admin.api';
import { showConfirm, showDeleteConfirm } from '@/core/utils/swal';

// Data
const sessions = ref<Session[]>([]);
const roles = ref<Role[]>([]);
const permissions = ref<Permission[]>([]);
const loading = ref(true);

// Permission Modal
const showPermissionModal = ref(false);
const editingPermission = ref<Permission | null>(null);
const permissionForm = ref({ permission_name: '', description: '' });

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    [sessions.value, roles.value, permissions.value] = await Promise.all([
      getSessions(),
      getRoles(),
      getPermissions(),
    ]);
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    loading.value = false;
  }
};

const getDeviceIcon = (session: Session) => {
  const ua = session.user_agent?.toLowerCase() || '';
  if (ua.includes('iphone') || ua.includes('android')) {
    return 'bi bi-phone-fill text-success';
  }
  if (ua.includes('ipad') || ua.includes('tablet')) {
    return 'bi bi-tablet-fill text-info';
  }
  return 'bi bi-laptop-fill text-primary';
};

const getRoleIcon = (roleName: string) => {
  const icons: Record<string, string> = {
    'Admin': 'bi bi-shield-fill',
    'Instructor': 'bi bi-mortarboard-fill',
    'Learner': 'bi bi-book-fill',
  };
  return icons[roleName] || 'bi bi-person-fill';
};

const handleRevokeSession = async (sessionId: string) => {
  const result = await showConfirm('ต้องการ revoke session นี้หรือไม่?');
  if (result.isConfirmed) {
    try {
      await revokeSession(sessionId);
      await loadData();
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  }
};

const handleLogoutAll = async () => {
  const result = await showConfirm('ต้องการ logout ทุก session หรือไม่?');
  if (result.isConfirmed) {
    try {
      await revokeAllSessions(0);
      await loadData();
    } catch (error) {
      console.error('Failed to logout all sessions:', error);
    }
  }
};

// === Permission CRUD ===
const openPermissionModal = (perm?: Permission) => {
  editingPermission.value = perm || null;
  permissionForm.value = perm 
    ? { permission_name: perm.permission_name, description: perm.description || '' }
    : { permission_name: '', description: '' };
  showPermissionModal.value = true;
};

const closePermissionModal = () => {
  showPermissionModal.value = false;
  editingPermission.value = null;
};

const handleSavePermission = async () => {
  try {
    if (editingPermission.value) {
      await updatePermission(editingPermission.value.permission_id, permissionForm.value);
    } else {
      await createPermission(permissionForm.value);
    }
    await loadData();
    closePermissionModal();
  } catch (error) {
    console.error('Failed to save permission:', error);
  }
};

const handleDeletePermission = async (perm: Permission) => {
  const result = await showDeleteConfirm(perm.permission_name, 'ยืนยันลบ Permission');
  if (result.isConfirmed) {
    try {
      await deletePermission(perm.permission_id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete permission:', error);
    }
  }
};

onMounted(loadData);
</script>

<style scoped>
.backoffice-layout {
  min-height: 100vh;
  background: #ffffff;
}

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header-modern {
  padding: 0 0 20px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.page-title-modern {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.page-subtitle-modern {
  color: #64748b;
  margin: 0;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
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

.stat-icon.emerald {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
}

.stat-icon.cyan {
  background: linear-gradient(135deg, #ecfeff, #cffafe);
  color: #0891b2;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #3b82f6;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* Section Card */
.section-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.section-title span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.section-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.section-icon.emerald {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
}

.section-icon.cyan {
  background: linear-gradient(135deg, #ecfeff, #cffafe);
  color: #0891b2;
}

.section-icon.blue {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #3b82f6;
}

/* Sessions List */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.session-device {
  display: flex;
  align-items: center;
  gap: 14px;
}

.device-icon {
  font-size: 1.5rem;
}

.session-device h5 {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: #0f172a;
}

.badge-current {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.session-details {
  display: flex;
  gap: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.9rem;
}

.detail-item i {
  color: #94a3b8;
}

/* Buttons */
.btn-danger-outline {
  padding: 10px 18px;
  background: white;
  border: 1px solid #fee2e2;
  color: #ef4444;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger-outline:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.btn-revoke {
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-revoke:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

/* Roles Grid */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.role-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.role-info h5 {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: #0f172a;
}

.role-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

/* Permissions Grid */
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.permission-icon {
  color: #059669;
  font-size: 1.1rem;
}

.permission-name {
  font-weight: 500;
  color: #0f172a;
  display: block;
}

.permission-desc {
  font-size: 0.8rem;
  color: #64748b;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Add Button */
.btn-add {
  padding: 10px 18px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* Action Buttons */
.role-actions,
.permission-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-icon-sm {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-sm:hover {
  border-color: #059669;
  color: #059669;
  background: #ecfdf5;
}

.btn-icon-sm.danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-content.modal-sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h5 {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
}

.btn-close::before,
.btn-close::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 2px;
  background: #64748b;
  top: 50%;
  left: 50%;
}

.btn-close::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.btn-close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}
</style>
