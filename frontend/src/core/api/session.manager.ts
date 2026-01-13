import pinia from "../../app/pinia";
import { useAuthStore } from "../../modules/auth/auth.store";

// Get auth store instance
export function getAuthStore() {
  return useAuthStore(pinia);
}

export function getAccessToken(): string | null {
  return getAuthStore().accessToken;
}

export function setTokens(access: string) {
  const authStore = getAuthStore();
  authStore.setTokens(access);
}

export function logoutSession() {
  getAuthStore().logout();
}
