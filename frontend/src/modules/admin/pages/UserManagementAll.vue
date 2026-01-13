<template>
  <div class="user-management-page">
    <div class="content-wrapper">
      <!-- Page Header -->
      <div class="page-header-modern">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title-modern">
              <i class="fas fa-users-cog me-2"></i>
              จัดการผู้ใช้งาน
            </h1>
            <p class="page-subtitle-modern">จัดการผู้ใช้งานและสิทธิ์การเข้าถึง</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline-light" @click="openAddModal">
              <i class="fas fa-user-plus me-2"></i>เพิ่มผู้ใช้งาน
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-card">
        <div class="filter-row">
          <div class="search-box-modern">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="ค้นหาชื่อ, อีเมล, หรือ role..."
            />
          </div>
          <select v-model="statusFilter" class="filter-select">
            <option value="">ทุกสถานะ</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select v-model="roleFilter" class="filter-select">
            <option value="">ทุก Role</option>
            <option v-for="role in roles" :key="role.role_id" :value="role.role_name">
              {{ role.role_name }}
            </option>
          </select>
          <button class="btn btn-filter" @click="resetFilters">
            <i class="fas fa-redo"></i>
          </button>
        </div>
      </div>

      <!-- User Table -->
      <div class="table-card">
        <div class="table-header-modern">
          <h5 class="mb-0">
            <i class="fas fa-list me-2"></i>รายชื่อผู้ใช้งาน
          </h5>
          <span class="text-muted">ทั้งหมด {{ filteredUsers.length }} ผู้ใช้</span>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>กำลังโหลด...</span>
        </div>

        <table v-else class="table-modern">
          <thead>
            <tr>
              <th>ผู้ใช้</th>
              <th>อีเมล</th>
              <th>Role</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in filteredUsers" 
              :key="user.user_id" 
              @click="navigateToDetail(user.user_id)"
              :class="{ 'inactive-row': !user.is_active }"
              class="cursor-pointer user-row"
            >
              <td>
                <div class="user-info-cell">
                  <div class="avatar" :style="getAvatarStyle(user)">
                    {{ getInitials(user) }}
                  </div>
                  <div>
                    <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                    <div class="user-last-login">เข้าสู่ระบบล่าสุด: {{ user.last_login_at || '-' }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span v-for="role in user.roles" :key="role" class="badge-role">
                  {{ role }}
                </span>
              </td>
              <td>
                <span :class="['badge-status', user.is_active ? 'active' : 'inactive']">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="แก้ไข" @click.stop="navigateToDetail(user.user_id)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-icon" 
                    :title="user.is_active ? 'Disable' : 'Enable'"
                    @click.stop="handleToggleStatus(user)"
                  >
                    <i :class="user.is_active ? 'fas fa-ban' : 'fas fa-check'"></i>
                  </button>
                  <button class="btn-icon danger" title="ลบ" @click.stop="handleDelete(user)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="table-footer">
          <span class="pagination-info">แสดง 1-{{ filteredUsers.length }} จาก {{ users.length }} รายการ</span>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h5>
              <i class="fas fa-user-plus me-2"></i>
              เพิ่มผู้ใช้งานใหม่
            </h5>
            <button class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="form-grid">
                <div class="form-group">
                  <label>ชื่อ <span class="required">*</span></label>
                  <input v-model="formData.first_name" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                  <label>นามสกุล <span class="required">*</span></label>
                  <input v-model="formData.last_name" type="text" class="form-input" required />
                </div>
                <div class="form-group full-width">
                  <label>อีเมล <span class="required">*</span></label>
                  <input v-model="formData.email" type="email" class="form-input" required />
                </div>
                <div class="form-group">
                  <label>Role <span class="required">*</span></label>
                  <select v-model="formData.selectedRoleId" class="form-input">
                    <option value="">เลือก Role</option>
                    <option v-for="role in roles" :key="role.role_id" :value="role.role_id">
                      {{ role.role_name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>สถานะ</label>
                  <select v-model="formData.is_active" class="form-input">
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">ยกเลิก</button>
            <button class="btn btn-primary" @click="handleSubmit">
              <i class="fas fa-save me-2"></i>บันทึก
            </button>
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
import { getUsers, getRoles, createUser, updateUser, deleteUser, toggleUserStatus } from '../admin.api';
import type { User, Role } from '../admin.api';
import { showDeleteConfirm, showSuccess, showError } from '@/core/utils/swal';

// Layout state removed (global)
const router = useRouter();

const navigateToDetail = (userId: number) => {
  router.push(`/users/${userId}`);
};

// Data
const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const loading = ref(true);

// Filters
const searchQuery = ref('');
const statusFilter = ref('');
const roleFilter = ref('');

// Modal
const showModal = ref(false);
const editingUser = ref<User | null>(null);
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  selectedRoleId: '' as string | number,
  is_active: true,
});

// Computed
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchSearch = searchQuery.value === '' || 
      user.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchStatus = statusFilter.value === '' ||
      (statusFilter.value === 'active' && user.is_active) ||
      (statusFilter.value === 'inactive' && !user.is_active);
    
    const matchRole = roleFilter.value === '' || user.roles.includes(roleFilter.value);
    
    return matchSearch && matchStatus && matchRole;
  });
});

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    [users.value, roles.value] = await Promise.all([getUsers(), getRoles()]);
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  roleFilter.value = '';
};

const getInitials = (user: User) => {
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  return `${first}${last}`.toUpperCase() || '?';
};

const getAvatarStyle = (user: User) => {
  const colors = [
    'linear-gradient(135deg, #059669, #10b981)',
    'linear-gradient(135deg, #0891b2, #06b6d4)',
    'linear-gradient(135deg, #3b82f6, #60a5fa)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  ];
  return { background: colors[user.user_id % colors.length] };
};

const openAddModal = () => {
  editingUser.value = null;
  formData.value = { first_name: '', last_name: '', email: '', selectedRoleId: '', is_active: true };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingUser.value = null;
};

const handleSubmit = async () => {
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.user_id, {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        is_active: formData.value.is_active,
      });
    } else {
      await createUser({
        email: formData.value.email,
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        role_ids: formData.value.selectedRoleId ? [Number(formData.value.selectedRoleId)] : [],
      });
    }
    await loadData();
    closeModal();
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

const handleToggleStatus = async (user: User) => {
  try {
    await toggleUserStatus(user.user_id);
    await loadData();
  } catch (error) {
    console.error('Failed to toggle status:', error);
  }
};

const handleDelete = async (user: User) => {
  const result = await showDeleteConfirm(`${user.first_name} ${user.last_name}`);
  if (result.isConfirmed) {
    try {
      await deleteUser(user.user_id);
      await loadData();
      showSuccess('ลบผู้ใช้สำเร็จ');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showError('ลบผู้ใช้ไม่สำเร็จ');
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

/* Page Header - Green Gradient */
.page-header-modern {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title-modern {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0 0 6px 0;
}

.page-subtitle-modern {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.btn-header-primary {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.btn-header-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
}

/* Filter Card */
.filter-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box-modern {
  position: relative;
  flex: 1;
}

.search-box-modern input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-box-modern input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.search-box-modern i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  min-width: 150px;
  cursor: pointer;
}

.btn-filter {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-filter:hover {
  border-color: #059669;
  color: #059669;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.table-modern {
  width: 100%;
  border-collapse: collapse;
}

.table-modern thead th {
  padding: 14px 20px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.table-modern tbody td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.table-modern tbody tr:hover {
  background: #f8fafc;
}

.table-modern tbody tr.inactive-row {
  opacity: 0.6;
}

/* User Info Cell */
.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
}

.user-last-login {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Badges */
.badge-role {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 4px;
}

.badge-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-status.active {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
}

.badge-status.inactive {
  background: #f1f5f9;
  color: #64748b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
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

.btn-icon:hover {
  border-color: #059669;
  color: #059669;
  background: #ecfdf5;
}

.btn-icon.danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

/* Table Footer */
.table-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pagination-info {
  color: #64748b;
  font-size: 0.9rem;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
}

.form-input {
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
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
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
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
}
</style>
