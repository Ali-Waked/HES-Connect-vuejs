<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axiosClient from '@/axiosClient'

const { t } = useI18n()
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import PasswordStrength from '@/components/auth/PasswordStrength.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthAlert from '@/components/auth/AuthAlert.vue'

const route = useRoute()
const router = useRouter()

const form = ref({
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const token = computed(() => route.query.token || '')
const email = computed(() => route.query.email || '')

const passwordsMatch = computed(() => {
  if (!form.value.password_confirmation) return true
  return form.value.password === form.value.password_confirmation
})

async function handleResetPassword() {
  error.value = ''

  if (!form.value.password) {
    error.value = 'Please enter a new password'
    return
  }
  if (form.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    await axiosClient.post('/reset-password', {
      token: token.value,
      email: email.value,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err) {
    if (err.response?.status === 422) {
      error.value = err.response.data.errors?.password?.[0] || 'Invalid or expired reset link'
    } else {
      error.value = 'Unable to reset password. The link may have expired.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout variant="split">
    <AuthCard>
      <!-- Success state -->
      <div v-if="success" class="text-center">
        <div class="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <svg class="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 class="text-xl sm:text-2xl font-bold text-landing-dark mb-2">{{ t('auth.resetSuccessTitle') }}</h1>
        <p class="text-xs sm:text-sm text-landing-muted leading-relaxed mb-5 sm:mb-6">
          {{ t('auth.resetSuccessMessage') }}
        </p>

        <router-link
          to="/login"
          class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {{ t('auth.goToSignIn') }}
        </router-link>
      </div>

      <!-- Form state -->
      <div v-else>
        <AuthHeader
          :title="t('auth.resetTitle')"
          :subtitle="t('auth.resetSubtitle')"
          :showLogo="false"
        />

        <AuthAlert
          v-if="error"
          type="error"
          :message="error"
          class="mb-4 sm:mb-6"
          dismissible
          @dismiss="error = ''"
        />

        <form @submit.prevent="handleResetPassword" class="space-y-4 sm:space-y-5">
          <div>
            <PasswordInput
              v-model="form.password"
              id="password"
              name="password"
              :label="t('auth.newPassword')"
              :placeholder="t('auth.min8CharPlaceholder')"
              autocomplete="new-password"
            />
            <PasswordStrength :password="form.password" class="mt-3" />
          </div>

          <div>
            <PasswordInput
              v-model="form.password_confirmation"
              id="password_confirmation"
              name="password_confirmation"
              :label="t('auth.confirmNewPassword')"
              :placeholder="t('auth.confirmPasswordPlaceholder')"
              autocomplete="new-password"
            />
            <p
              v-if="form.password_confirmation && !passwordsMatch"
              class="mt-1.5 text-xs text-danger flex items-center gap-1"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ t('auth.passwordsDoNotMatch') }}
            </p>
          </div>

          <AuthButton
            :loading="loading"
            full-width
            size="lg"
          >
            {{ loading ? t('auth.resettingPassword') : t('auth.resetPassword') }}
          </AuthButton>
        </form>

        <p class="text-center text-xs sm:text-sm text-slate-500 mt-5 sm:mt-6">
          {{ t('auth.rememberPassword') }}
          <router-link
            to="/login"
            class="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            {{ t('auth.signInLink') }}
          </router-link>
        </p>
      </div>
    </AuthCard>
  </AuthLayout>
</template>
