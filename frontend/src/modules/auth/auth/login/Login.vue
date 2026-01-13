<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../auth.store";
import { authApi } from "../../auth.api";

// Types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonOptions {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

// Vue composables
const authStore = useAuthStore();
const router = useRouter();

// State
const deviceId = ref(localStorage.getItem("device_id") || crypto.randomUUID());
const isLoading = ref(false);
const errorMessage = ref("");
const googleButtonRef = ref<HTMLElement | null>(null);

// Ensure device_id is stored
if (!localStorage.getItem("device_id")) {
  localStorage.setItem("device_id", deviceId.value);
}

// Google Sign-In Callback
const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
  const { credential } = response;
  if (!credential) {
    errorMessage.value = "ไม่สามารถรับ token จาก Google ได้";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await authApi.loginWithGoogle({
      id_token: credential,
      device_id: deviceId.value,
    });

    if (result.type === "mfa_required") {
      authStore.setMfaRequired(result.mfaTx);
      await router.replace("/mfa");
      return;
    }

    // Success
    authStore.setTokens(result.accessToken);
    authStore.setUser(result.user);
    await router.replace("/");
  } catch (err: any) {
    if (err.response?.status === 401) {
      errorMessage.value = "การยืนยันตัวตนล้มเหลว กรุณาลองใหม่";
    } else if (err.response?.status === 403) {
      errorMessage.value = "บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ";
    } else {
      errorMessage.value = err.response?.data?.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    }
    authStore.logout();
  } finally {
    isLoading.value = false;
  }
};

// Initialize Google Sign-In
const initializeGoogleSignIn = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || !window.google) return;

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    if (googleButtonRef.value) {
      window.google.accounts.id.renderButton(googleButtonRef.value, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 320,
      });
    }
  } catch (error) {
    console.error("❌ Google Sign-In Error:", error);
  }
};

onMounted(async () => {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = initializeGoogleSignIn;
  document.head.appendChild(script);
});
</script>

<template>
  <div class="login-page">
      <div class="left-section">
        <div class="overlay"></div>
        <div class="content">
          <div class="brand">
            <div class="logo-box">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" />
                <path d="M2 12L12 17L22 12" stroke="rgba(255,255,255,0.7)" stroke-width="2" />
              </svg>
            </div>
            <span>LMS Platform</span>
          </div>
          <h1>Learning Mock<br/><span class="text-emerald">Service</span></h1>
          <p>แพลตฟอร์มการเรียนรู้จำลองเพื่อยกระดับทักษะ</p>
        </div>
      </div>

      <!-- Right Section: Login Form -->
      <div class="right-section">
        <div class="login-card">
          <div class="card-header">
            <h2>ลงชื่อเข้าใช้งาน</h2>
            <p>เพื่อเข้าสู่ระบบการเรียนรู้จำลอง (Mock Education)</p>
          </div>

          <div class="card-body">
            <!-- Error Alert -->
            <div v-if="errorMessage" class="error-box">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="loading-box">
              <div class="spinner"></div>
              <p>กำลังดำเนินการ...</p>
            </div>

            <div v-show="!isLoading" class="auth-methods">
              <div ref="googleButtonRef" class="google-btn"></div>
              
              <div class="divider">
                <span>หรือ</span>
              </div>

              <button class="primary-btn green" disabled>
                เข้าสู่ระบบด้วยอีเมล
              </button>
            </div>
          </div>

          <div class="card-footer">
            <p>ต้องการความช่วยเหลือ? <a href="#">ติดต่อเรา</a></p>
            <div class="legal">
              <span>นโยบายความเป็นส่วนตัว</span>
              <span class="dot"></span>
              <span>ข้อกำหนดการใช้งาน</span>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600&display=swap');

.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  background-color: #f0fdf4;
  font-family: 'Anuphan', sans-serif;
  overflow: auto;
}

.login-wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* Left Section */
.left-section {
  flex: 1.4;
  position: relative;
  background-image: url('https://i.pinimg.com/originals/77/09/64/7709649833647e2c49e29e60dd8c793e.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 80px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(6, 78, 59, 0.9) 0%, rgba(6, 78, 59, 0.4) 50%, transparent 100%);
}

.left-section .content {
  position: relative;
  z-index: 10;
  color: white;
  max-width: 640px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-box {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand span {
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 18px;
}

.left-section h1 {
  font-size: 64px;
  font-weight: 600;
  line-height: 1.1;
  margin-bottom: 24px;
}

.text-emerald {
  color: #34d399;
}

.left-section p {
  font-size: 20px;
  opacity: 0.9;
  line-height: 1.6;
}

/* Right Section */
.right-section {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.05);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  margin-bottom: 40px;
}

.card-header h2 {
  font-size: 32px;
  font-weight: 600;
  color: #064e3b;
  margin-bottom: 8px;
}

.card-header p {
  color: #64748b;
  font-size: 16px;
}

/* Form Elements */
.error-box {
  background: #fef2f2;
  color: #dc2626;
  padding: 14px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  border: 1px solid #fee2e2;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-box {
  text-align: center;
  padding: 30px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.google-btn {
  display: flex;
  justify-content: center;
}

.divider {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #94a3b8;
  font-size: 14px;
}

.divider::before, .divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.primary-btn {
  width: 100%;
  padding: 14px;
  border-radius: 30px;
  font-weight: 500;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn.green {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.primary-btn.green:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.primary-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

/* Footer */
.card-footer {
  margin-top: 60px;
  text-align: center;
}

.card-footer p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.card-footer a {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}

.legal {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  font-size: 12px;
}

.dot {
  width: 3px;
  height: 3px;
  background: #cbd5e1;
  border-radius: 50%;
}

/* Responsive Scaling for 1080p and smaller */
@media (max-width: 1440px) {
  .left-section h1 { font-size: 52px; }
  .left-section { padding: 60px; }
}

@media (max-width: 1024px) {
  .left-section { display: none; }
  .right-section { flex: 1; }
  .login-card { max-width: 440px; }
}
</style>
