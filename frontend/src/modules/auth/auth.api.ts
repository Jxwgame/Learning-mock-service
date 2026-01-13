// src/modules/auth/auth.api.ts
import client from "../../core/api/client";

// ===== Request Types =====
export interface GoogleLoginPayload {
  id_token: string;
  device_id: string;
}

export interface MfaVerifyPayload {
  mfa_tx: string;
  otp: string;
  device_id: string;
  trust_device?: boolean;
}

// ===== Backend Response Types =====
interface BackendUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active: boolean;
}

interface BackendTokens {
  access_token: string;
}

interface BackendLoginSuccess {
  user: BackendUser;
  tokens: BackendTokens;
}

interface BackendMfaRequired {
  mfa_required: true;
  mfa_tx: string;
}

interface BackendMfaVerifySuccess {
  tokens: BackendTokens;
  mfa_trust_cookie: string | null;
  user: BackendUser;
}

interface BackendRefreshSuccess {
  tokens: {
    access_token: string;
  };
}

interface BackendSessionCheckSuccess {
  user: BackendUser;
  tokens: {
    access_token: string;
  };
}

// ===== Frontend Types (for store/components) =====
export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginSuccessResult {
  type: "success";
  accessToken: string;
  user: AuthUser;
}

export interface MfaRequiredResult {
  type: "mfa_required";
  mfaTx: string;
}

export type LoginResult = LoginSuccessResult | MfaRequiredResult;

export interface MfaVerifyResult {
  accessToken: string;
  user: AuthUser;
}

// ===== API Service =====
export const authApi = {
  // Login with Google ID Token || Returns either success with tokens or MFA required
  async loginWithGoogle(payload: GoogleLoginPayload): Promise<LoginResult> {
    const res = await client.post<BackendLoginSuccess | BackendMfaRequired>(
      "/auth/login",
      payload
    );

    // Check if MFA is required
    if ("mfa_required" in res.data && res.data.mfa_required) {
      return {
        type: "mfa_required",
        mfaTx: res.data.mfa_tx,
      };
    }

    // Success - parse to frontend format
    const data = res.data as BackendLoginSuccess;
    return {
      type: "success",
      accessToken: data.tokens.access_token,
      user: {
        id: data.user.user_id,
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        roles: data.user.roles || [],
      },
    };
  },

  // Request MFA OTP to be sent (email)
  async mfaChallenge(mfaTx: string, channel: string = "email"): Promise<void> {
    await client.post("/auth/mfa/challenge", { mfa_tx: mfaTx, channel });
  },

  // Verify MFA OTP and complete login
  async mfaVerify(payload: MfaVerifyPayload): Promise<MfaVerifyResult> {
    const res = await client.post<BackendMfaVerifySuccess>(
      "/auth/mfa/verify",
      payload
    );
    return {
      accessToken: res.data.tokens.access_token,
      user: {
        id: res.data.user.user_id,
        email: res.data.user.email,
        firstName: res.data.user.first_name,
        lastName: res.data.user.last_name,
        roles: res.data.user.roles || [],
      },
    };
  },

  async refresh(): Promise<{ accessToken: string }> {
    const res = await client.post<BackendRefreshSuccess>("/auth/refresh");
    return {
      accessToken: res.data.tokens.access_token,
    };
  },

  // Non-rotating session check for initialization
  async checkSession(): Promise<{ accessToken: string; user: AuthUser }> {
    const res = await client.get<BackendSessionCheckSuccess>("/auth/session");
    return {
      accessToken: res.data.tokens.access_token,
      user: {
        id: res.data.user.user_id,
        email: res.data.user.email,
        firstName: res.data.user.first_name,
        lastName: res.data.user.last_name,
        roles: res.data.user.roles || [],
      },
    };
  },

  // Logout current session
  async logout(): Promise<void> {
    await client.post("/auth/logout");
  },

  // Logout all sessions
  async logoutAll(): Promise<void> {
    await client.post("/auth/logout-all");
  },
};
