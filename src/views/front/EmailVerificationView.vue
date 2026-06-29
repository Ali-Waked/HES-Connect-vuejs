<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import axiosClient from '@/axiosClient'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthAlert from '@/components/auth/AuthAlert.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const loading = ref(false)
const resent = ref(false)
const error = ref('')
const cooldown = ref(0)

const userEmail = computed(() => authStore.user?.email || '')

function startCooldown() {
  cooldown.value = 60
  const timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function handleResend() {
  if (cooldown.value > 0) return

  loading.value = true
  error.value = ''
  try {
    await axiosClient.post('/email/verification-notification')
    resent.value = true
    startCooldown()
  } catch (err) {
    error.value = t('auth.verifyEmailError')
  } finally {
    loading.value = false
  }
}

function handleOpenMail() {
  const email = userEmail.value
  if (!email) return
  const domain = email.split('@')[1]
  if (domain) {
    window.open(`https://${domain}`, '_blank')
  }
}
</script>

<template>
  <AuthLayout variant="split">
    <AuthCard>
      <div class="text-center">
        <div class="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-brand-primary-light flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <svg class="w-7 sm:w-8 h-7 sm:h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <AuthHeader
          :title="t('auth.verifyEmailTitle')"
          :showLogo="false"
        >
          <p class="text-xs sm:text-sm text-landing-muted leading-relaxed -mt-3 sm:-mt-4">
            {{ t('auth.verifyEmailSent', { email: userEmail }) }}
          </p>
        </AuthHeader>

        <AuthAlert
          v-if="error"
          type="error"
          :message="error"
          class="mb-4 sm:mb-6 text-left"
          dismissible
          @dismiss="error = ''"
        />

        <AuthAlert
          v-if="resent"
          type="success"
          :message="t('auth.verifyEmailSuccess')"
          class="mb-4 sm:mb-6 text-left"
          dismissible
          @dismiss="resent = false"
        />

        <div class="space-y-3">
          <AuthButton
            variant="secondary"
            full-width
            @click="handleOpenMail"
          >
            <svg class="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {{ t('auth.openEmailApp') }}
          </AuthButton>

          <AuthButton
            :loading="loading"
            full-width
            @click="handleResend"
          >
            <span v-if="cooldown > 0">{{ t('auth.resendIn', { count: cooldown }) }}</span>
            <span v-else>{{ t('auth.resendVerification') }}</span>
          </AuthButton>
        </div>

        <div class="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
          <router-link
            to="/login"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {{ t('auth.backToSignIn') }}
          </router-link>
        </div>
      </div>
    </AuthCard>
  </AuthLayout>
</template>
