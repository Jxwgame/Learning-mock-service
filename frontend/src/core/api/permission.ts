import { getAuthStore } from "./session.manager";

export function hasPermission(permissionCode: string): boolean {
  const authStore = getAuthStore();
  return authStore.permissions.includes(permissionCode);
}

export function hasAnyPermission(permissionCodes: string[]): boolean {
  const authStore = getAuthStore();
  return permissionCodes.some((code) => authStore.permissions.includes(code));
}

export function hasAllPermissions(permissionCodes: string[]): boolean {
  const authStore = getAuthStore();
  return permissionCodes.every((code) => authStore.permissions.includes(code));
}

export function isUserAuthenticated(): boolean {
  return !!getAuthStore().accessToken;
}
