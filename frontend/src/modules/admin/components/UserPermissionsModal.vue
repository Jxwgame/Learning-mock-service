<template>
  <Teleport to="body">
    <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>
              จัดการ Permission รายบุคคล
            </h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          
          <div class="modal-body">
            <!-- User Info -->
            <div class="user-info-card mb-4">
              <div class="d-flex align-items-center gap-3">
                <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <h6 class="mb-0">{{ userName }}</h6>
                  <small class="text-muted">User ID: {{ userId }}</small>
                </div>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="text-center py-4">
              <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
              <p class="mt-2 text-muted">กำลังโหลด...</p>
            </div>

            <template v-else>
              <!-- Current Direct Permissions -->
              <div class="section mb-4">
                <h6 class="fw-bold mb-3">
                  <i class="fas fa-user-shield me-2 text-success"></i>
                  Permission ที่มอบให้โดยตรง (Direct Grants)
                </h6>
                <div v-if="grantedPermissions.length === 0" class="text-muted">
                  ยังไม่มี Permission ที่มอบให้โดยตรง
                </div>
                <div v-else class="list-group list-group-flush">
                  <div v-for="perm in grantedPermissions" :key="perm.id" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong class="text-success">{{ perm.permission_name }}</strong>
                      <br><small class="text-muted">{{ perm.description }}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" @click="handleRemove(perm.permission_name)" :disabled="actionLoading">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Revoked Permissions -->
              <div class="section mb-4">
                <h6 class="fw-bold mb-3">
                  <i class="fas fa-ban me-2 text-danger"></i>
                  Permission ที่ยึด (Explicit Denies)
                </h6>
                <div v-if="revokedPermissions.length === 0" class="text-muted">
                  ไม่มี Permission ที่ถูกยึด
                </div>
                <div v-else class="list-group list-group-flush">
                  <div v-for="perm in revokedPermissions" :key="perm.id" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong class="text-danger">{{ perm.permission_name }}</strong>
                      <br><small class="text-muted">{{ perm.description }}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" @click="handleRemove(perm.permission_name)" :disabled="actionLoading">
                      <i class="fas fa-undo"></i> คืนค่า
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add Permission -->
              <div class="section">
                <h6 class="fw-bold mb-3">
                  <i class="fas fa-plus-circle me-2 text-primary"></i>
                  เพิ่ม Permission
                </h6>
                <div class="row g-2">
                  <div class="col">
                    <select v-model="selectedPermission" class="form-select">
                      <option value="">-- เลือก Permission --</option>
                      <option v-for="perm in availablePermissions" :key="perm.permission_id" :value="perm.permission_name">
                        {{ perm.permission_name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-auto">
                    <button class="btn btn-success" @click="handleGrant" :disabled="!selectedPermission || actionLoading">
                      <i class="fas fa-plus me-1"></i> Grant
                    </button>
                  </div>
                  <div class="col-auto">
                    <button class="btn btn-danger" @click="handleRevoke" :disabled="!selectedPermission || actionLoading">
                      <i class="fas fa-ban me-1"></i> Revoke
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close">ปิด</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { 
  getUserDirectPermissions, 
  grantUserPermission, 
  revokeUserPermission, 
  removeUserDirectPermission,
  getPermissions,
  type DirectUserPermission,
  type Permission
} from '../admin.api';
import { showConfirm } from '@/core/utils/swal';

const props = defineProps<{
  userId: number;
  userName?: string;
}>();

const emit = defineEmits(['updated']);

const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const loading = ref(false);
const actionLoading = ref(false);
const directPermissions = ref<DirectUserPermission[]>([]);
const allPermissions = ref<Permission[]>([]);
const selectedPermission = ref('');

const grantedPermissions = computed(() => 
  directPermissions.value.filter(p => !p.is_revoked)
);

const revokedPermissions = computed(() => 
  directPermissions.value.filter(p => p.is_revoked)
);

const availablePermissions = computed(() => {
  const existing = new Set(directPermissions.value.map(p => p.permission_name));
  return allPermissions.value.filter(p => !existing.has(p.permission_name));
});

async function loadData() {
  loading.value = true;
  try {
    const [perms, all] = await Promise.all([
      getUserDirectPermissions(props.userId),
      getPermissions()
    ]);
    directPermissions.value = perms;
    allPermissions.value = all;
  } catch (e) {
    console.error('Failed to load permissions:', e);
  } finally {
    loading.value = false;
  }
}

async function handleGrant() {
  if (!selectedPermission.value) return;
  actionLoading.value = true;
  try {
    await grantUserPermission(props.userId, selectedPermission.value);
    selectedPermission.value = '';
    await loadData();
    emit('updated');
  } catch (e) {
    console.error('Grant failed:', e);
  } finally {
    actionLoading.value = false;
  }
}

async function handleRevoke() {
  if (!selectedPermission.value) return;
  actionLoading.value = true;
  try {
    await revokeUserPermission(props.userId, selectedPermission.value);
    selectedPermission.value = '';
    await loadData();
    emit('updated');
  } catch (e) {
    console.error('Revoke failed:', e);
  } finally {
    actionLoading.value = false;
  }
}

async function handleRemove(permissionName: string) {
  const result = await showConfirm(`ต้องการลบ ${permissionName} ออกจาก Direct Permissions หรือไม่?`);
  if (!result.isConfirmed) return;
  actionLoading.value = true;
  try {
    await removeUserDirectPermission(props.userId, permissionName);
    await loadData();
    emit('updated');
  } catch (e) {
    console.error('Remove failed:', e);
  } finally {
    actionLoading.value = false;
  }
}

function open() {
  loadData();
  if (modalRef.value && !modalInstance) {
    modalInstance = new Modal(modalRef.value);
  }
  modalInstance?.show();
}

function close() {
  modalInstance?.hide();
}

defineExpose({ open, close });

onMounted(() => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value);
  }
});
</script>

<style scoped>
.modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header .btn-close {
  filter: brightness(0) invert(1);
}

.user-info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
}

.section {
  background: #fafafa;
  border-radius: 12px;
  padding: 1rem;
}

.list-group-item {
  background: transparent;
  border: none;
  border-bottom: 1px solid #eee;
}

.list-group-item:last-child {
  border-bottom: none;
}
</style>
