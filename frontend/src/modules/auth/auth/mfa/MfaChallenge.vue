<template>
  <div class="mfa-page">
    <div class="mfa-container">
      <div class="mfa-header">
      <div class="mfa-icon">
        <i class="bi bi-shield-check"></i>
      </div>
      <h1>ยืนยันตัวตนแบบสองขั้นตอน</h1>
      <p>Two-Factor Authentication</p>
    </div>

    <div class="mfa-body">
      <div class="verification-info">
        <p>
          กรุณากรอกรหัสยืนยัน
          <strong>6 หลัก</strong> ที่ส่งไปยังอีเมลของคุณ
        </p>
      </div>

      <form @submit.prevent="submitVerify">
        <div class="code-inputs" @paste.prevent="onPaste">
          <input
            v-for="idx in 6"
            :key="idx - 1"
            :ref="(el) => registerInputRef(el, idx - 1)"
            v-model="otpDigits[idx - 1]"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="code-input"
            @input="onInput($event, idx - 1)"
            @keydown="onKeydown($event, idx - 1)"
            pattern="[0-9]"
            aria-label="OTP digit"
          />
        </div>
        <div style="margin-top: 12px">
          <button type="submit" class="btn btn-verify" :disabled="loading">
            <i class="bi bi-check-circle me-2"></i>
            <span v-if="!loading">ยืนยันรหัส</span>
            <span v-else>กำลังตรวจสอบ...</span>
          </button>
        </div>
        <div v-if="error" class="text-danger" style="margin-top: 8px">
          {{ errorMessage }}
        </div>
      </form>

      <div class="resend-section" style="margin-top: 16px">
        <p>ไม่ได้รับรหัสยืนยัน?</p>
        <button
          class="btn-resend"
          @click="resendCode"
          :disabled="resendLoading || resendCooldown > 0"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>
          <span v-if="resendLoading">กำลังส่ง...</span>
          <span v-else-if="resendCooldown > 0">รอ {{ resendCooldown }} วินาที</span>
          <span v-else>ส่งรหัสใหม่อีกครั้ง</span>
        </button>
      </div>

      <div class="security-note" style="margin-top: 16px">
        <i class="bi bi-exclamation-triangle"></i>
        <div>
          <strong>หมายเหตุ:</strong> รหัสยืนยันจะหมดอายุภายใน 10 นาที
          อย่าแชร์รหัสนี้กับผู้อื่น
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import type { ComponentPublicInstance } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../auth.store";
import { authApi } from "../../auth.api";

// Vue composables
const router = useRouter();
const authStore = useAuthStore();

// Get mfa_tx from auth store (set during login)
const mfaTx = computed(() => authStore.mfaTx);

// Redirect to login if no mfa_tx
if (!mfaTx.value) {
  router.replace({ name: "login" }).catch(() => {});
}

// OTP digits (6 digits)
const otpDigits = ref<string[]>(Array(6).fill(""));

// Input refs for focus management
const inputRefs = ref<(HTMLInputElement | undefined)[]>([]);

// UI state
const loading = ref(false);
const resendLoading = ref(false);
const resendCooldown = ref(0);
const error = ref<string | null>(null);

// Error message mapping
const errorMessage = computed(() => {
  switch (error.value) {
    case "MFA_TX_MISSING":
      return "ไม่พบ Transaction ID กรุณาเข้าสู่ระบบใหม่";
    case "INVALID_INPUT":
      return "กรุณากรอกรหัส 6 หลัก";
    case "MFA_VERIFY_FAILED":
      return "การยืนยันล้มเหลว กรุณาลองใหม่";
    case "MFA_TX_EXPIRED":
      return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
    case "MFA_OTP_EXPIRED":
      return "รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่";
    case "MFA_OTP_INVALID":
      return "รหัสยืนยันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    case "MFA_TOO_MANY_ATTEMPTS":
      return "กรอกผิดเกินจำนวนครั้งที่กำหนด กรุณาเข้าสู่ระบบใหม่";
    case "MFA_SEND_RATE_LIMIT":
      return "ส่งรหัสบ่อยเกินไป กรุณารอสักครู่";
    default:
      return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่";
  }
});

// Device ID
const deviceId = localStorage.getItem("device_id") || crypto.randomUUID();
localStorage.setItem("device_id", deviceId);

// Cooldown timer
let cooldownInterval: ReturnType<typeof setInterval> | null = null;

function startCooldown(seconds: number) {
  resendCooldown.value = seconds;
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
    }
  }, 1000);
}

// Register input refs
function registerInputRef(
  el: Element | ComponentPublicInstance | null,
  idx: number
) {
  if (el instanceof HTMLInputElement) {
    inputRefs.value[idx] = el;
  }
}

// Focus input
function focusInput(idx: number) {
  const el = inputRefs.value[idx];
  if (el instanceof HTMLInputElement) {
    el.focus();
  }
}

// Get combined OTP
const getOtp = () => otpDigits.value.join("");

// Handle input
function onInput(e: Event, idx: number) {
  const input = e.target as HTMLInputElement;
  const v = (input.value || "").replace(/[^0-9]/g, "").slice(0, 1);
  input.value = v;
  otpDigits.value[idx] = v;

  if (v && idx < otpDigits.value.length - 1) {
    const next = inputRefs.value[idx + 1];
    if (next instanceof HTMLInputElement) {
      next.focus();
    }
  }
}

// Handle keydown
function onKeydown(e: KeyboardEvent, idx: number) {
  const input = e.target as HTMLInputElement;

  if (e.ctrlKey || e.metaKey) {
    // Allow shortcuts like Ctrl+V, Ctrl+C
    return;
  }

  if (e.key === "Backspace") {
    if (!input.value && idx > 0) {
      const prev = inputRefs.value[idx - 1];
      if (prev instanceof HTMLInputElement) {
        prev.focus();
        prev.value = "";
        otpDigits.value[idx - 1] = "";
        e.preventDefault();
      }
    }
  } else if (e.key === "ArrowLeft" && idx > 0) {
    focusInput(idx - 1);
    e.preventDefault();
  } else if (e.key === "ArrowRight" && idx < otpDigits.value.length - 1) {
    focusInput(idx + 1);
    e.preventDefault();
  } else if (e.key.length === 1 && /[0-9]/.test(e.key)) {
    // Allow digits
  } else if (e.key.length === 1) {
    e.preventDefault();
  }
}

// Handle paste
function onPaste(e: ClipboardEvent) {
  const pasted = e.clipboardData?.getData("text") || "";
  const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");
  if (digits.length === 0) return;

  // Update model first
  digits.forEach((d, i) => {
    otpDigits.value[i] = d;
  });

  // Force update DOM values next tick ensuring Vue reactivity catches up
  nextTick(() => {
    digits.forEach((d, i) => {
       const el = inputRefs.value[i];
       if (el instanceof HTMLInputElement) {
         el.value = d;
       }
    });
    
    const nextIdx = Math.min(digits.length, otpDigits.value.length - 1);
    focusInput(nextIdx);
  });
}

// Verify OTP
async function submitVerify(e?: Event) {
  e?.preventDefault();
  error.value = null;

  if (!mfaTx.value) {
    error.value = "MFA_TX_MISSING";
    return;
  }

  const otp = getOtp();
  if (otp.length !== 6) {
    error.value = "INVALID_INPUT";
    return;
  }

  try {
    loading.value = true;
    const result = await authApi.mfaVerify({
      mfa_tx: mfaTx.value,
      otp,
      device_id: deviceId,
      trust_device: true,
    });

    // Set tokens in store
    authStore.setTokens(result.accessToken);
    
    // Set user in store
    if (result.user) {
      authStore.setUser(result.user);
    }

    authStore.clearMfa();

    // Navigate to home
    await router.replace({ name: "home" });
  } catch (err: any) {
    error.value = err?.response?.data?.error || "MFA_VERIFY_FAILED";
  } finally {
    loading.value = false;
  }
}

// Resend OTP
async function resendCode() {
  if (!mfaTx.value) {
    error.value = "MFA_TX_MISSING";
    return;
  }

  try {
    resendLoading.value = true;
    error.value = null;
    await authApi.mfaChallenge(mfaTx.value, "email");
    startCooldown(60);
  } catch (err: any) {
    error.value = err?.response?.data?.error || "MFA_CHALLENGE_FAILED";
  } finally {
    resendLoading.value = false;
  }
}

// Send OTP on mount
async function sendInitialOtp() {
  if (!mfaTx.value) {
    return;
  }

  try {
    console.log("🔄 Sending MFA OTP...");
    await authApi.mfaChallenge(mfaTx.value, "email");
    console.log("✅ OTP sent to email");
    startCooldown(60);
  } catch (err: any) {
    console.error("❌ Failed to send OTP:", err);
    error.value = err?.response?.data?.error || "MFA_CHALLENGE_FAILED";
  }
}

// Focus first input and send OTP on mount
onMounted(async () => {
  nextTick(() => {
    if (inputRefs.value[0]) {
      (inputRefs.value[0] as HTMLInputElement).focus();
    }
  });

  // Send OTP automatically
  await sendInitialOtp();
});

// Cleanup
onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
  }
});
</script>

<style scoped>
/* CSS Variables for this component */
.mfa-page {
  --primary-blue: #0d6efd;
  --primary-green: #20c997;
  --gradient-start: #0891b2;
  --gradient-end: #10b981;
  --bg-light: #f0fdfa;
}

.mfa-page {
  position: fixed;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--gradient-start) 0%,
    var(--gradient-end) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

.mfa-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: 450px;
  width: 100%;
  margin: 20px;
}

.mfa-header {
  background: linear-gradient(
    135deg,
    var(--gradient-start) 0%,
    var(--gradient-end) 100%
  );
  padding: 40px 30px;
  text-align: center;
  color: white;
}

.mfa-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  backdrop-filter: blur(10px);
}

.mfa-icon i {
  font-size: 40px;
}

.mfa-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.mfa-header p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.mfa-body {
  padding: 40px 30px;
}

.verification-info {
  background: var(--bg-light);
  border-left: 4px solid var(--primary-green);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.verification-info p {
  margin: 0;
  font-size: 14px;
  color: #0f766e;
}

.verification-info strong {
  color: #065f46;
}

.code-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.code-input {
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.code-input:focus {
  border-color: var(--gradient-start);
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
  outline: none;
}

.btn-verify {
  background: linear-gradient(
    135deg,
    var(--gradient-start) 0%,
    var(--gradient-end) 100%
  );
  border: none;
  color: white;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-verify:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(8, 145, 178, 0.3);
}

.btn-verify:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.resend-section {
  text-align: center;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #e5e7eb;
}

.resend-section p {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 10px;
}

.btn-resend {
  color: var(--gradient-start);
  background: none;
  border: none;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
  cursor: pointer;
}

.btn-resend:hover:not(:disabled) {
  color: var(--gradient-end);
  text-decoration: underline;
}

.btn-resend:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.security-note {
  display: flex;
  align-items: start;
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  color: #78350f;
}

.security-note i {
  color: #f59e0b;
  font-size: 18px;
  flex-shrink: 0;
}

@media (max-width: 576px) {
  .code-input {
    width: 45px;
    height: 55px;
    font-size: 20px;
  }

  .mfa-body {
    padding: 30px 20px;
  }
}
</style>
