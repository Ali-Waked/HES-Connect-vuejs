<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import PasswordStrength from '@/components/auth/PasswordStrength.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthAlert from '@/components/auth/AuthAlert.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  agreeTerms: false,
})

const localErrors = ref({})

const passwordsMatch = computed(() => {
  if (!form.password_confirmation) return true
  return form.password === form.password_confirmation
})

async function handleRegister() {
  localErrors.value = {}

  if (!form.name.trim()) {
    localErrors.value.name = 'Full name is required'
  }
  if (!form.email) {
    localErrors.value.email = 'Email address is required'
  }
  if (!form.password) {
    localErrors.value.password = 'Password is required'
  } else if (form.password.length < 8) {
    localErrors.value.password = 'Password must be at least 8 characters'
  }
  if (form.password !== form.password_confirmation) {
    localErrors.value.password_confirmation = 'Passwords do not match'
  }
  if (!form.agreeTerms) {
    localErrors.value.agreeTerms = 'You must agree to the terms and conditions'
  }

  if (Object.keys(localErrors.value).length > 0) return

  const result = await authStore.register({
    name: form.name,
    email: form.email,
    password: form.password,
    password_confirmation: form.password_confirmation,
  })

  if (result.success) {
    router.push('/verify-email')
  }
}

function getFieldError(field) {
  return localErrors.value[field] || authStore.errors[field]?.[0] || ''
}

function clearFieldError(field) {
  delete localErrors.value[field]
  if (authStore.errors[field]) {
    delete authStore.errors[field]
  }
}
</script>

<template>
  <AuthLayout variant="split">
    <AuthCard>
      <AuthHeader
        :title="t('auth.createYourAccount')"
        :subtitle="t('auth.joinHesConnect')"
        :showLogo="false"
      />

      <AuthAlert
        v-if="authStore.errors.general"
        type="error"
        :message="authStore.errors.general"
        class="mb-4 sm:mb-6"
      />

      <form @submit.prevent="handleRegister" class="space-y-4 sm:space-y-5" novalidate>
        <div>
          <AuthInput
            v-model="form.name"
            id="name"
            name="name"
            type="text"
            :label="t('auth.fullName')"
            :placeholder="t('auth.namePlaceholder')"
            autocomplete="name"
            :error="getFieldError('name')"
            @input="clearFieldError('name')"
          />
        </div>

        <div>
          <AuthInput
            v-model="form.email"
            id="email"
            name="email"
            type="email"
            :label="t('auth.email')"
            placeholder="you@hospital.org"
            autocomplete="email"
            :error="getFieldError('email')"
            @input="clearFieldError('email')"
          />
        </div>

        <div>
          <PasswordInput
            v-model="form.password"
            id="password"
            name="password"
            :label="t('auth.password')"
            placeholder="Min. 8 characters"
            autocomplete="new-password"
            :error="getFieldError('password')"
            @input="clearFieldError('password')"
          />
          <PasswordStrength :password="form.password" class="mt-3" />
        </div>

        <div>
          <PasswordInput
            v-model="form.password_confirmation"
            id="password_confirmation"
            name="password_confirmation"
            :label="t('auth.confirmPassword')"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            autocomplete="new-password"
            :error="getFieldError('password_confirmation')"
            @input="clearFieldError('password_confirmation')"
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

        <div>
          <div class="flex items-start gap-2.5">
            <input
              id="agreeTerms"
              v-model="form.agreeTerms"
              type="checkbox"
              class="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/30 cursor-pointer"
              @change="clearFieldError('agreeTerms')"
            />
            <label for="agreeTerms" class="text-xs sm:text-sm text-slate-600 cursor-pointer select-none leading-relaxed">
              I agree to the
              <a href="/terms" class="font-medium text-brand-primary hover:text-brand-primary-hover transition-colors" target="_blank">{{ t('auth.termsOfService') }}</a>
              and
              <a href="/privacy" class="font-medium text-brand-primary hover:text-brand-primary-hover transition-colors" target="_blank">{{ t('auth.privacyPolicy') }}</a>
            </label>
          </div>
          <p v-if="getFieldError('agreeTerms')" class="mt-1.5 text-xs text-danger flex items-center gap-1 ml-6">
            {{ getFieldError('agreeTerms') }}
          </p>
        </div>

        <AuthButton
          :loading="authStore.loading"
          full-width
          size="lg"
        >
          {{ authStore.loading ? t('auth.creatingAccount') : t('auth.createAccount') }}
        </AuthButton>
      </form>

      <p class="text-center text-xs sm:text-sm text-slate-500 mt-5 sm:mt-6">
        {{ t('auth.haveAccount') }}
        <router-link
          to="/login"
          class="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
        >
          {{ t('auth.signInLink') }}
        </router-link>
      </p>
    </AuthCard>
  </AuthLayout>
</template>
