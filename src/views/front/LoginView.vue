<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthAlert from '@/components/auth/AuthAlert.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const localErrors = ref({})

async function handleLogin() {
  localErrors.value = {}

  if (!form.email) {
    localErrors.value.email = 'Email address is required'
    return
  }
  if (!form.password) {
    localErrors.value.password = 'Password is required'
    return
  }

  const result = await authStore.login({
    email: form.email,
    password: form.password,
  })

  if (result.success) {
    const redirect = route.query.redirect

    if (redirect) {
      router.push(redirect)
    } else {
      router.push(authStore.dashboardRoute || '/')
    }
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
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        :showLogo="false"
      />

      <AuthAlert
        v-if="authStore.errors.general"
        type="error"
        :message="authStore.errors.general"
        class="mb-6"
      />

      <form @submit.prevent="handleLogin" class="space-y-5" novalidate>
        <div>
          <AuthInput
            v-model="form.email"
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autocomplete="email"
            :error="getFieldError('email')"
            @input="clearFieldError('email')"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="password" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
            <router-link
              to="/forgot-password"
              class="text-xs font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              Forgot password?
            </router-link>
          </div>
          <PasswordInput
            v-model="form.password"
            id="password"
            name="password"
            placeholder="Enter your password"
            autocomplete="current-password"
            :error="getFieldError('password')"
            @input="clearFieldError('password')"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            id="remember"
            v-model="form.remember"
            type="checkbox"
            class="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/30 cursor-pointer"
          />
          <label for="remember" class="text-sm text-slate-600 cursor-pointer select-none">
            Keep me signed in
          </label>
        </div>

        <AuthButton
          :loading="authStore.loading"
          full-width
          size="lg"
        >
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </AuthButton>
      </form>

      <p class="text-center text-sm text-slate-500 mt-6">
        Don't have an account?
        <router-link
          to="/register"
          class="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
        >
          Create account
        </router-link>
      </p>
    </AuthCard>
  </AuthLayout>
</template>
