<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axiosClient from '@/axiosClient'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthAlert from '@/components/auth/AuthAlert.vue'

const authStore = useAuthStore()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')
const resendCooldown = ref(0)

async function handleForgotPassword() {
  error.value = ''

  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  loading.value = true
  try {
    await axiosClient.post('/forgot-password', { email: email.value })
    sent.value = true
    startResendCooldown()
  } catch (err) {
    if (err.response?.status === 422) {
      error.value = err.response.data.errors?.email?.[0] || 'Invalid email address'
    } else {
      error.value = 'Unable to send reset link. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function startResendCooldown() {
  resendCooldown.value = 60
  const timer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

async function handleResend() {
  if (resendCooldown.value > 0) return
  await handleForgotPassword()
}
</script>

<template>
  <AuthLayout variant="centered">
    <AuthCard>
      <!-- Success state -->
      <div v-if="sent" class="text-center">
        <div class="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-landing-dark mb-2">Check your email</h1>
        <p class="text-sm text-landing-muted leading-relaxed mb-6">
          We've sent a password reset link to
          <span class="font-medium text-slate-700">{{ email }}</span>.
          Please check your inbox and follow the instructions.
        </p>

        <div class="bg-slate-50 rounded-xl p-4 mb-6">
          <p class="text-xs text-slate-500 leading-relaxed">
            Didn't receive the email? Check your spam folder or
            <button
              type="button"
              class="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors cursor-pointer"
              :disabled="resendCooldown > 0"
              @click="handleResend"
            >
              <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
              <span v-else>resend the link</span>
            </button>
          </p>
        </div>

        <router-link
          to="/login"
          class="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to sign in
        </router-link>
      </div>

      <!-- Form state -->
      <div v-else>
        <AuthHeader
          title="Reset your password"
          subtitle="Enter your email address and we'll send you a link to reset your password"
          :showLogo="false"
        />

        <AuthAlert
          v-if="error"
          type="error"
          :message="error"
          class="mb-6"
          dismissible
          @dismiss="error = ''"
        />

        <form @submit.prevent="handleForgotPassword" class="space-y-5">
          <AuthInput
            v-model="email"
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@hospital.org"
            autocomplete="email"
          />

          <AuthButton
            :loading="loading"
            full-width
            size="lg"
          >
            {{ loading ? 'Sending reset link...' : 'Send Reset Link' }}
          </AuthButton>
        </form>

        <p class="text-center text-sm text-slate-500 mt-6">
          Remember your password?
          <router-link
            to="/login"
            class="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            Sign in
          </router-link>
        </p>
      </div>
    </AuthCard>
  </AuthLayout>
</template>
