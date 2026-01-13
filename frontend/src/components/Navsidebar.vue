<template>
  <nav class="sidebar" :class="{ collapsed: collapsed, show: mobileOpen }">
    <!-- Header -->
    <div class="sidebar-header">
      <a href="/" class="sidebar-brand d-flex align-items-center gap-3 text-decoration-none">
        <div class="brand-icon d-flex align-items-center justify-content-center">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="brand-text" v-show="!collapsed">
          <span class="brand-name d-block fw-bold text-dark">LMS Platform</span>
          <span class="brand-tagline d-block text-muted small">Learning Mock Service</span>
        </div>
      </a>
      <button class="collapse-btn btn d-none d-lg-flex align-items-center justify-content-center" @click="toggleCollapse">
        <i class="fas" :class="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>
    </div>

    <!-- User Info -->
    <div class="user-info mx-3 mt-3 p-2 rounded-4 d-flex align-items-center gap-2">
      <div class="user-avatar position-relative d-flex align-items-center justify-content-center">
        <span class="fw-bold text-white">{{ userInitials }}</span>
        <div class="avatar-status online position-absolute"></div>
      </div>
      <div class="user-details flex-grow-1 min-w-0" v-show="!collapsed">
        <p class="user-name fw-bold mb-0 text-truncate text-black">{{ userName }}</p>
        <div class="user-role-badge d-inline-flex align-items-center gap-1 small text-muted">
          <span class="role-indicator bg-success rounded-circle"></span>
          {{ userRoleDisplay }}
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-nav flex-grow-1 py-3">
      <!-- My Learning Section - Everyone -->
      <div class="nav-section">
        <div class="nav-section-title d-flex align-items-center gap-2 px-4 py-2" v-show="!collapsed">
          <span class="section-line"></span>
          <span class="section-text text-uppercase small fw-bold text-muted">การเรียน</span>
        </div>
        <ul class="nav flex-column">
          <!-- Admin/Instructor Home -->
          <li class="nav-item px-3" v-if="isAdminOrInstructor">
            <router-link to="/" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active" exact>
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-tachometer-alt"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">หน้าหลัก</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
          <!-- Learner Home -->
          <li class="nav-item px-3" v-if="showStrictLearnerHome">
            <router-link to="/learner-home" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-home"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">หน้าแรกผู้เรียน</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
          <li class="nav-item px-3">
            <router-link 
              to="/my-courses" 
              class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" 
              active-class="active"
              :class="{ 'active': route.path.startsWith('/learning') }"
            >
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-book-open"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">คอร์สของฉัน</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>

        </ul>
      </div>

      <!-- Course Section -->
      <div class="nav-section">
        <div class="nav-section-title d-flex align-items-center gap-2 px-4 py-2" v-show="!collapsed">
          <span class="section-line"></span>
          <span class="section-text text-uppercase small fw-bold text-muted">คอร์ส</span>
        </div>
        <ul class="nav flex-column">
          <li class="nav-item px-3">
            <router-link to="/courses" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-list"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">รายการคอร์ส</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>

          
          <!-- Course Management - Admin Only -->
          <li class="nav-item px-3" v-if="hasPermission('admin.access')">
            <a
              href="javascript:void(0)"
              class="nav-link has-submenu d-flex align-items-center gap-3 rounded-3"
              :class="{ collapsed: !courseSubmenuOpen }"
              data-bs-toggle="collapse"
              @click.prevent="courseSubmenuOpen = !courseSubmenuOpen"
            >
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-edit"></i>
              </div>
              <span class="nav-text flex-grow-1" v-show="!collapsed">จัดการคอร์ส</span>
              <i class="fas fa-chevron-down submenu-arrow small" v-show="!collapsed"></i>
            </a>
            <div class="collapse submenu" :class="{ show: courseSubmenuOpen }" id="courseManageSubmenu">
              <ul class="nav flex-column">
                <li class="nav-item px-3">
                  <router-link to="/courses/manage" class="nav-link d-flex align-items-center gap-3 rounded-3" active-class="active">
                    <div class="nav-icon-wrapper small d-flex align-items-center justify-content-center rounded-3">
                      <i class="fas fa-tasks"></i>
                    </div>
                    <span class="nav-text">ภาพรวมการจัดการ</span>
                  </router-link>
                </li>
                <li class="nav-item px-3">
                  <router-link to="/courses/create" class="nav-link d-flex align-items-center gap-3 rounded-3" active-class="active">
                    <div class="nav-icon-wrapper small d-flex align-items-center justify-content-center rounded-3">
                      <i class="fas fa-plus-circle"></i>
                    </div>
                    <span class="nav-text">สร้างคอร์สใหม่</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <li class="nav-item px-3" v-if="hasAnyRole('instructor')">
            <router-link to="/courses/teaching" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-chalkboard-teacher"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">คอร์สที่สอน</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nav-section" v-if="isAdmin">
        <div class="nav-section-title d-flex align-items-center gap-2 px-4 py-2" v-show="!collapsed">
          <span class="section-line"></span>
          <span class="section-text text-uppercase small fw-bold text-muted">ผู้ดูแล</span>
        </div>
        <ul class="nav flex-column">
          <li class="nav-item px-3">
            <router-link to="/instructors" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-users"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">จัดการเรียนการสอน</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>

        </ul>
      </div>

      <div class="nav-divider mx-4 my-2" v-if="hasAnyRole('admin', 'instructor')"></div>

      <!-- Assignments Section -->
      <div class="nav-section">
        <div class="nav-section-title d-flex align-items-center gap-2 px-4 py-2" v-show="!collapsed">
          <span class="section-line"></span>
          <span class="section-text text-uppercase small fw-bold text-muted">แบบฝึกหัด</span>
        </div>
        <ul class="nav flex-column">
          <!-- Assignments - Learner -->
          <li class="nav-item px-3">
            <router-link to="/my-assignments" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">แบบฝึกหัด</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
          <!-- Manage Assignments - Instructor/Admin -->
          <li class="nav-item px-3" v-if="hasAnyRole('admin', 'instructor')">
            <router-link to="/assignments" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-tasks"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">จัดการแบบฝึกหัด</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
          <!-- Grading - Instructor/Admin -->
          <li class="nav-item px-3" v-if="hasAnyRole('admin', 'instructor')">
            <router-link to="/grading" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">ตรวจงาน</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nav-divider mx-4 my-2" v-if="hasPermission('admin.access')"></div>

      <!-- Admin Section - Admin only -->
      <div class="nav-section" v-if="hasPermission('admin.access')">
        <div class="nav-section-title d-flex align-items-center gap-2 px-4 py-2" v-show="!collapsed">
          <span class="section-line"></span>
          <span class="section-text text-uppercase small fw-bold text-muted">ระบบ</span>
        </div>
        <ul class="nav flex-column">
          <li class="nav-item px-3">
            <router-link to="/users" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-users-cog"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">จัดการผู้ใช้</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
          <li class="nav-item px-3">
            <router-link to="/reports" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-chart-bar"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">รายงาน</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
          <li class="nav-item px-3">
            <router-link to="/logs" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-scroll"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">Logs</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
          <li class="nav-item px-3">
            <router-link to="/settings" class="nav-link d-flex align-items-center gap-3 rounded-3 position-relative" active-class="active">
              <div class="nav-icon-wrapper d-flex align-items-center justify-content-center rounded-3">
                <i class="fas fa-cog"></i>
              </div>
              <span class="nav-text text-truncate" v-show="!collapsed">ตั้งค่า</span>
              <div class="active-indicator position-absolute"></div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "../modules/auth/auth.store";
import { usePermissions } from "../core/permissions/permissions";
import { useRoute } from "vue-router";

const props = defineProps<{
  collapsed: boolean;
  mobileOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-collapse'): void;
  (e: 'close-mobile'): void;
}>();

const authStore = useAuthStore();
const route = useRoute();
const { isAdmin, isLearner, hasAnyRole, hasPermission } = usePermissions();

const isAdminOrInstructor = computed(() => hasAnyRole('admin', 'instructor', 'super_admin'));

const showStrictLearnerHome = computed(() => {
  return isLearner.value && !isAdminOrInstructor.value;
});

const courseSubmenuOpen = ref(false);

const toggleCollapse = () => {
  emit('toggle-collapse');
};

const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "Guest";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
});

const userInitials = computed(() => {
  const user = authStore.user;
  if (!user) return "G";
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
});

const userRoleDisplay = computed(() => {
  const roles = authStore.user?.roles || [];
  if (roles.includes("super_admin")) return "Super Admin";
  if (roles.includes("Admin")) return "Administrator";
  if (roles.includes("Instructor")) return "Instructor";
  if (roles.includes("Learner")) return "Learner";
  return "User";
});
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width, 280px);
  height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 1050;
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed, 88px);
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Enhanced header styling */
.sidebar-header {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.brand-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: linear-gradient(145deg, #059669, #10b981);
  color: white;
  font-size: 1.1rem;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
  transition: all 0.3s ease;
}

.sidebar-brand:hover .brand-icon {
  transform: scale(1.05) rotate(-3deg);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
}

.brand-name {
  font-size: 1rem;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

.brand-tagline {
  font-size: 0.65rem;
  letter-spacing: 0.02em;
}

.collapse-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(145deg, #f8fafc, #e2e8f0);
  border: none;
  color: #64748b;
  font-size: 0.7rem;
  transition: all 0.25s ease;
}

.collapse-btn:hover {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
  color: #059669;
  transform: scale(1.05);
}

/* Improved user info card */
.user-info {
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.user-avatar {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 12px;
  background: linear-gradient(145deg, #059669, #10b981);
  font-size: 0.9rem;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
}

.avatar-status {
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #f8fafc;
}

.avatar-status.online {
  background: linear-gradient(145deg, #10b981, #059669);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.5);
}

.user-name {
  font-size: 0.875rem;
  color: #f1f5f9;
}

.role-indicator {
  width: 6px;
  height: 6px;
}

.user-menu-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  padding: 0;
  transition: all 0.2s ease;
}

.user-menu-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* Navigation styling with smooth hover effects */
.sidebar-nav {
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 0.25rem;
}

.section-line {
  width: 12px;
  height: 2px;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: 2px;
}

.section-text {
  font-size: 0.65rem;
  letter-spacing: 0.05em;
}

.nav-link {
  padding: 0.65rem 0.875rem;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  background: linear-gradient(145deg, rgba(5, 150, 105, 0.06), rgba(16, 185, 129, 0.04));
  color: #059669;
}

.nav-link.active {
  background: linear-gradient(145deg, rgba(5, 150, 105, 0.12), rgba(16, 185, 129, 0.08));
  color: #059669;
}

/* Icon wrapper with gradient backgrounds */
.nav-icon-wrapper {
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
  font-size: 0.9rem;
  color: #64748b;
  transition: all 0.25s ease;
}

.nav-icon-wrapper.small {
  width: 30px;
  height: 30px;
  min-width: 30px;
  font-size: 0.8125rem;
}

.nav-link:hover .nav-icon-wrapper {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
  color: #059669;
  transform: scale(1.05);
}

.nav-link.active .nav-icon-wrapper {
  background: linear-gradient(145deg, #059669, #10b981);
  color: white;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* Active indicator bar */
.active-indicator {
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(180deg, #059669, #10b981);
  border-radius: 4px 0 0 4px;
  transition: height 0.25s ease;
}

.nav-link.active .active-indicator {
  height: 60%;
}

/* Submenu styling */
.submenu-arrow {
  transition: transform 0.25s ease;
  color: #94a3b8;
}

.nav-link.has-submenu:not(.collapsed) .submenu-arrow {
  transform: rotate(180deg);
}

.submenu {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  margin: 0.25rem 0.75rem;
  overflow: hidden;
}

.submenu .nav-link {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
}

.nav-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.06), transparent);
}

/* Footer card with gradient */
.footer-card {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
  border: 1px solid rgba(5, 150, 105, 0.1);
  cursor: pointer;
  transition: all 0.25s ease;
}

.footer-card:hover {
  background: linear-gradient(145deg, #d1fae5, #a7f3d0);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.2);
}

.footer-icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  background: linear-gradient(145deg, #059669, #10b981);
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.footer-title {
  color: #059669;
}

/* Mobile overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1045;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* Responsive */
@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.show {
    transform: translateX(0);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
  }

  .sidebar.collapsed {
    width: 280px;
  }
}

@media (min-width: 992px) {
  .sidebar-overlay {
    display: none;
  }
}
</style>
