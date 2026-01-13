import { defineStore } from "pinia";
import type { AuthUser } from "./auth.api";
import { authApi } from "./auth.api";

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isInitialized: boolean;

  // MFA
  mfaRequired: boolean;
  mfaTx: string | null;

  // Internal Logic
  initPromise: Promise<void> | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
    isInitialized: false,
    mfaRequired: false,
    mfaTx: null,
    initPromise: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isMfaRequired: (state) => state.mfaRequired,
    permissions: (state) => state.user?.roles || [],
  },

  actions: {
    setTokens(access: string) {
      this.accessToken = access;
    },

    setUser(user: AuthUser) {
      this.user = user;
    },

    async init() {
      if (this.isInitialized) return;
      // Prevent concurrent calls (Race condition on Refresh Token Rotation)
      if (this.initPromise) return this.initPromise;

      this.initPromise = (async () => {
        try {
          console.log("[Auth] Init started (Hybrid Flow)");
          // 1. Attempt non-rotating session check
          const { accessToken, user } = await authApi.checkSession();
          console.log("[Auth] Session check success, user:", user.email);
          this.accessToken = accessToken;
          this.user = user;
        } catch (error: any) {
          // Silent failure - user is simply not logged in
          if (error?.response) {
            console.log("[Auth] Session check failed (Not logged in):", error.response.status);
          } else {
            console.error("[Auth] Session check failed (Server unreachable):", error.message);
          }
          this.accessToken = null;
          this.user = null;
        } finally {
          this.isInitialized = true;
          this.initPromise = null;
          console.log("[Auth] Init complete. Authenticated:", !!this.accessToken);
        }
      })();

      return this.initPromise;
    },

    setMfaRequired(mfaTx: string) {
      this.mfaRequired = true;
      this.mfaTx = mfaTx;
    },

    clearMfa() {
      this.mfaRequired = false;
      this.mfaTx = null;
    },

    logout() {
      this.accessToken = null;
      this.user = null;
      this.mfaRequired = false;
      this.mfaTx = null;
    },
  },
});
