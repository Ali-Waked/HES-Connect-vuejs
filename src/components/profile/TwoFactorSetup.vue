<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import axiosClient from '@/axiosClient'
import {
  getSecretKey,
  getQrCode,
  getRecoveryCodes,
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  regenerateRecoveryCodes,
} from '@/services/twoFactorService'

const { t } = useI18n()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const is2faEnabled = computed(() => !!authStore.user?.two_factor_confirmed_at)

const loading = ref(false)
const enabling = ref(false)
const confirming = ref(false)
const disabling = ref(false)
const confirmingPassword = ref(false)

const setupState = ref('idle')
const qrCodeSvg = ref('')
const secretKey = ref('')
const verificationCode = ref('')
const recoveryCodes = ref([])
const showRecoveryCodes = ref(false)

const showPasswordModal = ref(false)
const passwordInput = ref('')
const passwordError = ref('')

const errors = ref({})
const generalError = ref('')

function resetSetup() {
  setupState.value = 'idle'
  qrCodeSvg.value = ''
  secretKey.value = ''
  verificationCode.value = ''
  recoveryCodes.value = []
  showRecoveryCodes.value = false
  showPasswordModal.value = false
  passwordInput.value = ''
  passwordError.value = ''
  errors.value = {}
  generalError.value = ''
}

async function fetchStatus() {
  try {
    const { data } = await axiosClient.get('/profile')
    const userData = data.user || data
    if (userData.two_factor_confirmed_at !== undefined) {
      authStore.user = { ...authStore.user, ...userData }
    }
    if (is2faEnabled.value) {
      const res = await getRecoveryCodes()
      recoveryCodes.value = res.data.recovery_codes || []
    }
  } catch {
    // silent
  }
}

function handleEnable() {
  showPasswordModal.value = true
  passwordInput.value = ''
  passwordError.value = ''
}

async function confirmPasswordAndEnable() {
  if (!passwordInput.value) {
    passwordError.value = t('twoFactor.passwordRequired') || 'Password is required'
    return
  }

  confirmingPassword.value = true
  passwordError.value = ''
  generalError.value = ''

  try {
    await axiosClient.post('/user/confirm-password', { password: passwordInput.value })
    showPasswordModal.value = false

    enabling.value = true
    await enableTwoFactor()

    const [secretRes, qrRes] = await Promise.all([getSecretKey(), getQrCode()])
    secretKey.value = secretRes.data.secret || secretRes.data
    qrCodeSvg.value = qrRes.data

    setupState.value = 'qr'
  } catch (err) {
    if (err.response?.status === 422 || err.response?.status === 403) {
      passwordError.value = err.response?.data?.message || t('twoFactor.wrongPassword') || 'Incorrect password'
    } else {
      showPasswordModal.value = false
      generalError.value = err.response?.data?.message || t('twoFactor.enableFailed') || 'Failed to enable 2FA'
    }
  } finally {
    confirmingPassword.value = false
    enabling.value = false
  }
}

async function handleConfirm() {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    errors.value = { code: t('twoFactor.invalidCode') || 'Enter a valid 6-digit code' }
    return
  }

  confirming.value = true
  errors.value = {}
  generalError.value = ''
  try {
    await confirmTwoFactor(verificationCode.value)
    const res = await getRecoveryCodes()
    recoveryCodes.value = res.data.recovery_codes || []
    setupState.value = 'recovery'
    dashboardStore.addToast(t('twoFactor.enabled') || 'Two-factor authentication enabled', 'success')
    await fetchStatus()
  } catch (err) {
    if (err.response?.status === 422) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.code?.[0]
      errors.value = { code: msg || t('twoFactor.invalidCode') || 'Invalid verification code' }
    } else {
      generalError.value = err.response?.data?.message || t('twoFactor.confirmFailed') || 'Failed to confirm 2FA'
    }
  } finally {
    confirming.value = false
  }
}

async function handleDisable() {
  if (!confirm(t('twoFactor.confirmDisable') || 'Are you sure you want to disable 2FA?')) return

  disabling.value = true
  generalError.value = ''
  try {
    await disableTwoFactor()
    dashboardStore.addToast(t('twoFactor.disabled') || 'Two-factor authentication disabled', 'success')
    recoveryCodes.value = []
    resetSetup()
    await fetchStatus()
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 422) {
      generalError.value = err.response?.data?.message || t('twoFactor.wrongPassword') || 'Password confirmation required'
    } else {
      generalError.value = err.response?.data?.message || t('twoFactor.disableFailed') || 'Failed to disable 2FA'
    }
  } finally {
    disabling.value = false
  }
}

async function handleRegenerateCodes() {
  loading.value = true
  generalError.value = ''
  try {
    const res = await regenerateRecoveryCodes()
    recoveryCodes.value = res.data.recovery_codes || []
    showRecoveryCodes.value = true
    dashboardStore.addToast(t('twoFactor.codesRegenerated') || 'Recovery codes regenerated', 'success')
  } catch (err) {
    generalError.value = err.response?.data?.message || t('twoFactor.regenerateFailed') || 'Failed to regenerate codes'
  } finally {
    loading.value = false
  }
}

function copyRecoveryCodes() {
  navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
  dashboardStore.addToast(t('twoFactor.codesCopied') || 'Recovery codes copied', 'success')
}

onMounted(fetchStatus)
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
          {{ t('twoFactor.title') || 'Two-Factor Authentication' }}
        </h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ t('twoFactor.description') || 'Add an extra layer of security to your account by enabling two-factor authentication.' }}
        </p>
      </div>
      <div v-if="is2faEnabled && setupState === 'idle'"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ t('twoFactor.enabled') || 'Enabled' }}
      </div>
    </div>

    <div v-if="generalError" class="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
      <p class="text-sm text-red-600">{{ generalError }}</p>
    </div>

    <!-- Not enabled: show enable button -->
    <div v-if="!is2faEnabled && setupState === 'idle'" class="mt-5">
      <button
        type="button"
        :disabled="enabling"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:opacity-60"
        @click="handleEnable"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        {{ enabling ? (t('twoFactor.enabling') || 'Enabling...') : (t('twoFactor.enable') || 'Enable 2FA') }}
      </button>
    </div>

    <!-- Setup: QR Code + verification -->
    <div v-if="setupState === 'qr'" class="mt-5 space-y-5">
      <div class="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-5">
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {{ t('twoFactor.scanQr') || 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)' }}
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <div
            class="flex-shrink-0 w-48 h-48 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2"
            v-html="qrCodeSvg"
          />
          <div class="text-center sm:text-left space-y-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {{ t('twoFactor.secretKey') || 'Secret Key' }}
              </p>
              <p class="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-white break-all select-all bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                {{ secretKey }}
              </p>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ t('twoFactor.manualEntry') || 'If you can\'t scan, enter this key manually in your authenticator app.' }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
          {{ t('twoFactor.verificationCode') || 'Verification Code' }}
        </label>
        <div class="flex gap-3">
          <input
            v-model="verificationCode"
            type="text"
            inputmode="numeric"
            maxlength="6"
            pattern="[0-9]*"
            autocomplete="one-time-code"
            :placeholder="t('twoFactor.codePlaceholder') || 'Enter 6-digit code'"
            class="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            :class="{ 'border-red-300': errors.code }"
            @keyup.enter="handleConfirm"
          />
          <button
            type="button"
            :disabled="confirming || verificationCode.length !== 6"
            class="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:opacity-60"
            @click="handleConfirm"
          >
            {{ confirming ? (t('twoFactor.confirming') || 'Confirming...') : (t('twoFactor.confirm') || 'Verify') }}
          </button>
        </div>
        <p v-if="errors.code" class="mt-1.5 text-xs text-red-500">{{ errors.code }}</p>
      </div>

      <button
        type="button"
        class="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition"
        @click="resetSetup"
      >
        {{ t('twoFactor.cancel') || 'Cancel' }}
      </button>
    </div>

    <!-- Recovery Codes shown after setup -->
    <div v-if="setupState === 'recovery'" class="mt-5 space-y-4">
      <div class="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {{ t('twoFactor.saveRecoveryCodes') || 'Save your recovery codes' }}
            </p>
            <p class="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {{ t('twoFactor.recoveryCodesWarning') || 'Store these recovery codes in a safe place. If you lose your authenticator device, you can use these codes to access your account. Each code can only be used once.' }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div
          v-for="(code, i) in recoveryCodes"
          :key="i"
          class="rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-3 py-2 text-center font-mono text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {{ code }}
        </div>
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
          @click="copyRecoveryCodes"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {{ t('twoFactor.copyCodes') || 'Copy Codes' }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
          @click="setupState = 'idle'"
        >
          {{ t('twoFactor.done') || 'Done' }}
        </button>
      </div>
    </div>

    <!-- Already enabled: show actions -->
    <div v-if="is2faEnabled && setupState === 'idle'" class="mt-5 space-y-4">
      <div class="flex items-center gap-3">
        <button
          type="button"
          :disabled="disabling"
          class="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          @click="handleDisable"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          {{ disabling ? (t('twoFactor.disabling') || 'Disabling...') : (t('twoFactor.disable') || 'Disable 2FA') }}
        </button>

        <button
          type="button"
          :disabled="loading"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60"
          @click="handleRegenerateCodes"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {{ loading ? (t('twoFactor.regenerating') || 'Regenerating...') : (t('twoFactor.regenerateCodes') || 'Regenerate Recovery Codes') }}
        </button>
      </div>

      <!-- Inline recovery codes display -->
      <div v-if="showRecoveryCodes && recoveryCodes.length" class="space-y-3">
        <div class="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            <div>
              <p class="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {{ t('twoFactor.newRecoveryCodes') || 'New Recovery Codes' }}
              </p>
              <p class="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {{ t('twoFactor.oldCodesInvalid') || 'Your old recovery codes are no longer valid.' }}
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div
            v-for="(code, i) in recoveryCodes"
            :key="i"
            class="rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-3 py-2 text-center font-mono text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {{ code }}
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
          @click="copyRecoveryCodes"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {{ t('twoFactor.copyCodes') || 'Copy Codes' }}
        </button>
      </div>
    </div>

    <!-- Password Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showPasswordModal = false" />
          <div class="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                  {{ t('twoFactor.confirmPasswordTitle') || 'Confirm Password' }}
                </h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ t('twoFactor.confirmPasswordDesc') || 'Enter your password to continue.' }}
                </p>
              </div>
            </div>

            <div v-if="passwordError" class="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p class="text-sm text-red-600 dark:text-red-400">{{ passwordError }}</p>
            </div>

            <form @submit.prevent="confirmPasswordAndEnable">
              <label class="block">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {{ t('twoFactor.password') || 'Password' }}
                </span>
                <input
                  v-model="passwordInput"
                  type="password"
                  autocomplete="current-password"
                  :placeholder="t('twoFactor.passwordPlaceholder') || 'Enter your password'"
                  class="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  @keyup.enter="confirmPasswordAndEnable"
                />
              </label>

              <div class="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                  @click="showPasswordModal = false"
                >
                  {{ t('twoFactor.cancel') || 'Cancel' }}
                </button>
                <button
                  type="submit"
                  :disabled="confirmingPassword || !passwordInput"
                  class="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:opacity-60"
                >
                  {{ confirmingPassword ? (t('twoFactor.confirming') || 'Confirming...') : (t('twoFactor.confirm') || 'Confirm') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
