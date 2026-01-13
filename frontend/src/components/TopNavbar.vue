<template>
  <nav class="top-navbar" :class="{ 'collapsed': isSidebarCollapsed }" id="topNavbar">
    <div class="navbar-content">
      <div class="navbar-left">
        <button class="menu-toggle btn" id="menuToggle" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <div class="page-title-wrapper">
          <h5 class="page-title mb-0">{{ pageTitle }}</h5>
          <div class="breadcrumb-line"></div>
        </div>
      </div>

      <div class="navbar-right">

        <!-- Profile Dropdown -->
        <div class="nav-item-top dropdown profile-dropdown" ref="dropdownRef">
          <button
            class="profile-btn d-flex align-items-center gap-3"
            @click="toggleDropdown"
            :aria-expanded="isDropdownOpen"
          >
            <div class="profile-avatar position-relative">
              <span>{{ userInitials }}</span>
              <div class="avatar-ring"></div>
            </div>
            <div class="profile-info text-start d-none d-md-block">
              <div class="profile-name fw-semibold">{{ userName }}</div>
              <div class="profile-role text-muted small d-flex align-items-center gap-1">
                <span class="role-dot bg-success rounded-circle"></span>
                {{ userRoleDisplay }}
              </div>
            </div>
            <i class="fas fa-chevron-down chevron-icon text-muted d-none d-md-inline"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end profile-menu shadow-lg border-0" :class="{ 'show': isDropdownOpen }">
            <div class="profile-header d-flex align-items-center gap-3 p-3 bg-light">
              <div class="profile-avatar-large position-relative">
                <span>{{ userInitials }}</span>
                <div class="avatar-status online position-absolute"></div>
              </div>
              <div class="profile-details">
                <div class="profile-name-large fw-bold">{{ userName }}</div>
                <div class="profile-email text-muted small">{{ userEmail }}</div>
              </div>
            </div>
            <div class="menu-section p-2">
              <router-link to="/profile" class="menu-item d-flex align-items-center gap-3 rounded-3 text-decoration-none">
                <div class="menu-icon rounded-3 d-flex align-items-center justify-content-center">
                  <i class="fas fa-user"></i>
                </div>
                <span class="flex-grow-1">โปรไฟล์</span>
                <i class="fas fa-chevron-right text-muted small"></i>
              </router-link>

            </div>
            <div class="dropdown-divider mx-3"></div>
            <div class="p-2">
              <a href="#" class="menu-item logout d-flex align-items-center gap-3 rounded-3 text-decoration-none text-danger" @click.prevent="handleLogout">
                <div class="menu-icon logout-icon rounded-3 d-flex align-items-center justify-content-center">
                  <i class="fas fa-sign-out-alt"></i>
                </div>
                <span>ออกจากระบบ</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/auth.store";

const props = defineProps<{
  isSidebarCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-mobile-sidebar'): void;
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Sidebar toggle
const toggleSidebar = () => {
  emit('toggle-mobile-sidebar');
};

// User info from auth store
const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "Guest";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
});

const userEmail = computed(() => authStore.user?.email || "");

const userInitials = computed(() => {
  const user = authStore.user;
  if (!user) return "G";
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
});

const userRoleDisplay = computed(() => {
  const roles = (authStore.user?.roles || []).map(r => r.toLowerCase());
  if (roles.includes("super_admin")) return "Super Admin";
  if (roles.includes("admin")) return "Administrator";
  if (roles.includes("instructor")) return "Instructor";
  if (roles.includes("learner")) return "Learner";
  return "User";
});

// Dropdown State Management
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

// Logout handler
const handleLogout = async () => {
  try {
    authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    authStore.logout();
    router.push("/login");
  }
};

// Page title based on current route
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    home: "หน้าหลัก",
    courses: "คอร์ส",
    lessons: "บทเรียน",
    assignments: "แบบฝึกหัด",
    users: "จัดการผู้ใช้",
    settings: "ตั้งค่า",
  };
  return titles[route.name as string] || "หน้าหลัก";
});
</script>

<style scoped>
/* Modern glassmorphism navbar with Bootstrap integration */
.top-navbar {
  position: fixed;
  top: 0;
  left: var(--sidebar-width, 280px);
  right: 0;
  height: var(--navbar-height, 72px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 1200;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.top-navbar.collapsed {
  left: var(--sidebar-width-collapsed, 88px);
}

.navbar-content {
  height: 100%;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Improved menu toggle button */
.menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(145deg, #f8fafc, #e2e8f0);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #475569;
  font-size: 1.125rem;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.menu-toggle:hover {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
  color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
}

.page-title-wrapper {
  position: relative;
}

.page-title {
  color: #0f172a;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.025em;
}

/* Animated underline accent */
.breadcrumb-line {
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 28px;
  height: 3px;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.page-title-wrapper:hover .breadcrumb-line {
  width: 100%;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.nav-item-top {
  position: relative;
}

/* Refined nav buttons with smooth hover effects */
.nav-btn {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(145deg, #ffffff, #f1f5f9);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #64748b;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-btn:hover {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
  color: #059669;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.18);
  border-color: rgba(5, 150, 105, 0.2);
}

.nav-btn:active {
  transform: translateY(-1px);
}

/* Enhanced notification badge with pulse animation */
.notification-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 12px;
  min-width: 22px;
  text-align: center;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.45);
  border: 2px solid white;
}

.badge-pulse {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 14px;
  background: #10b981;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: -1;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 0; }
}

/* Modern profile button with hover effects */
.profile-btn {
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.profile-btn:hover {
  background: linear-gradient(145deg, #ffffff, #f1f5f9);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.profile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(145deg, #059669, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  position: relative;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 16px;
  border: 2px solid rgba(5, 150, 105, 0.15);
  animation: ring-pulse 3s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.profile-name {
  font-size: 0.875rem;
  color: #0f172a;
  line-height: 1.3;
}

.profile-role {
  font-size: 0.75rem;
  line-height: 1.3;
}

.role-dot {
  width: 7px;
  height: 7px;
}

.chevron-icon {
  font-size: 0.7rem;
  transition: transform 0.25s ease;
}

.profile-btn:hover .chevron-icon {
  transform: rotate(180deg);
}

/* Enhanced dropdown menus with modern styling */
.dropdown-menu {
  min-width: 320px;
  border-radius: 20px;
  padding: 0;
  margin-top: 0.75rem;
  background: #ffffff;
  overflow: hidden;
  animation: dropdown-fade 0.2s ease;
}

@keyframes dropdown-fade {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.notification-dropdown .dropdown-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(145deg, #f8fafc, #ffffff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 1rem;
  color: #0f172a;
}

.dropdown-body {
  max-height: 340px;
  overflow-y: auto;
}

.dropdown-body::-webkit-scrollbar {
  width: 4px;
}

.dropdown-body::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}

.notification-item {
  padding: 1rem 1.5rem;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.notification-item:hover {
  background: linear-gradient(145deg, #f8fafc, #ffffff);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.notification-icon.success {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
  color: #059669;
}

.notification-icon.info {
  background: linear-gradient(145deg, #eff6ff, #dbeafe);
  color: #3b82f6;
}

.notification-icon.warning {
  background: linear-gradient(145deg, #fffbeb, #fef3c7);
  color: #f59e0b;
}

.notification-title {
  font-size: 0.875rem;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.75rem;
}

.notification-time i {
  font-size: 0.625rem;
}

.dropdown-footer {
  padding: 1rem 1.5rem;
  background: linear-gradient(145deg, #f8fafc, #ffffff);
}

.view-all-link {
  transition: all 0.2s ease;
}

.view-all-link:hover {
  gap: 0.75rem !important;
}

.view-all-link i {
  transition: transform 0.2s ease;
}

.view-all-link:hover i {
  transform: translateX(4px);
}

/* Profile menu styling */
.profile-menu {
  min-width: 300px;
  right: 1rem !important;
}

.profile-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.profile-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(145deg, #059669, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
}

.avatar-status {
  bottom: -3px;
  right: -3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
}

.avatar-status.online {
  background: linear-gradient(145deg, #10b981, #059669);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.5);
}

.profile-name-large {
  font-size: 1rem;
  color: #0f172a;
}

.profile-email {
  font-size: 0.8125rem;
}

.menu-item {
  padding: 0.875rem 1rem;
  color: #475569;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
  color: #0f172a;
}

.menu-icon {
  width: 38px;
  height: 38px;
  min-width: 38px;
  background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
  font-size: 0.9375rem;
  color: #64748b;
  transition: all 0.2s ease;
}

.menu-item:hover .menu-icon {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
  color: #059669;
}

.menu-item.logout:hover {
  background: linear-gradient(145deg, #fef2f2, #fee2e2);
}

.menu-item.logout .logout-icon {
  background: linear-gradient(145deg, #fef2f2, #fee2e2);
  color: #ef4444;
}

/* Responsive */
@media (max-width: 991.98px) {
  .top-navbar {
    left: 0;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .navbar-content {
    padding: 0 1rem;
  }

  .dropdown-menu {
    min-width: 290px;
  }

  .profile-btn {
    padding: 0.375rem;
  }
}
</style>
