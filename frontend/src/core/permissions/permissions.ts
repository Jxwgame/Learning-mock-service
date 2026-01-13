import { useAuthStore } from "@/modules/auth/auth.store";
import { computed } from "vue";

// Permission constants
export const PERMISSIONS = {
    // Course
    COURSE_CREATE: "course.create",
    COURSE_UPDATE: "course.update",
    COURSE_READ: "course.read",

    // Version
    VERSION_CREATE: "course.version.create",
    VERSION_PUBLISH: "course.version.publish",

    // Content
    CONTENT_MANAGE: "course.content.manage",

    // Enrollment
    ENROLLMENT_MANAGE: "enrollment.manage",
    ENROLLMENT_SELF: "enrollment.self",
} as const;

// Role constants
export const ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    INSTRUCTOR: "instructor",
    LEARNER: "learner",
} as const;

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: Object.values(PERMISSIONS),
    admin: [
        PERMISSIONS.COURSE_CREATE,
        PERMISSIONS.COURSE_UPDATE,
        PERMISSIONS.COURSE_READ,
        PERMISSIONS.VERSION_CREATE,
        PERMISSIONS.VERSION_PUBLISH,
        PERMISSIONS.CONTENT_MANAGE,
        PERMISSIONS.ENROLLMENT_MANAGE,
    ],
    instructor: [
        PERMISSIONS.COURSE_READ,
        PERMISSIONS.VERSION_CREATE,
        PERMISSIONS.VERSION_PUBLISH,
        PERMISSIONS.CONTENT_MANAGE,
        PERMISSIONS.ENROLLMENT_MANAGE,
    ],
    learner: [
        PERMISSIONS.COURSE_READ,
        PERMISSIONS.ENROLLMENT_SELF,
    ],
};

// Get permissions for a role
export function getPermissionsForRole(role: string): string[] {
    return ROLE_PERMISSIONS[role.toLowerCase()] || [];
}

// Get all permissions for user's roles
export function getUserPermissions(roles: string[]): string[] {
    const permissions = new Set<string>();
    roles.forEach((role) => {
        getPermissionsForRole(role).forEach((p) => permissions.add(p));
    });
    return Array.from(permissions);
}

// Composable for permission checking
export function usePermissions() {
    const authStore = useAuthStore();

    const userRoles = computed(() => authStore.user?.roles || []);

    const userPermissions = computed(() => getUserPermissions(userRoles.value));

    const isSuperAdmin = computed(() =>
        userRoles.value.some(r => r.toLowerCase() === ROLES.SUPER_ADMIN)
    );

    const hasPermission = (permission: string): boolean => {
        return isSuperAdmin.value || userPermissions.value.includes(permission);
    };

    const hasAnyPermission = (...permissions: string[]): boolean => {
        return isSuperAdmin.value || permissions.some((p) => hasPermission(p));
    };

    const hasAllPermissions = (...permissions: string[]): boolean => {
        return isSuperAdmin.value || permissions.every((p) => hasPermission(p));
    };

    const hasRole = (role: string): boolean => {
        return userRoles.value.some(
            (r) => r.toLowerCase() === role.toLowerCase()
        );
    };

    const hasAnyRole = (...roles: string[]): boolean => {
        return isSuperAdmin.value || roles.some((role) => hasRole(role));
    };

    const isAdmin = computed(() => isSuperAdmin.value || hasRole(ROLES.ADMIN));
    const isInstructor = computed(() => isSuperAdmin.value || hasRole(ROLES.INSTRUCTOR));
    const isLearner = computed(() => isSuperAdmin.value || hasRole(ROLES.LEARNER));

    return {
        userRoles,
        userPermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        isAdmin,
        isInstructor,
        isLearner,
        isSuperAdmin,
    };
}
