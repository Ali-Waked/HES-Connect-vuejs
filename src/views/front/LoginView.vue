<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)

async function handleLogin() {
  const result = await authStore.login(form)
  if (result.success) {
    const role = authStore.user?.role?.name
    if (role === 'admin') {
      router.push('/admin/dashboard')
    } else if (['doctor', 'nurse', 'hospital_manager', 'pharmacist'].includes(role)) {
      router.push('/staff/dashboard')
    } else {
      router.push('/')
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
    <div class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">

      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-primary/25">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
        </div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition"
            :class="authStore.errors.email ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-brand-primary'"
          />
          <p v-if="authStore.errors.email" class="text-xs text-red-500 mt-1">{{ authStore.errors.email[0] }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Password
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 pr-11 bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition"
              :class="authStore.errors.password ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-brand-primary'"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M9.879 9.879a3 3 0 104.243 4.243M7.05 7.05C5.68 8.42 4.5 10.1 4.5 12c1.274 4.057 5.064 7 9.542 7 1.606 0 3.12-.372 4.473-1.034"/>
              </svg>
            </button>
          </div>
          <p v-if="authStore.errors.password" class="text-xs text-red-500 mt-1">{{ authStore.errors.password[0] }}</p>
        </div>

        <div
          v-if="authStore.errors.general"
          class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p class="text-xs text-red-600 dark:text-red-400">{{ authStore.errors.general }}</p>
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/20 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <svg v-if="authStore.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>

      </form>

      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Don't have an account?
        <router-link to="/register" class="text-brand-primary font-semibold hover:underline">
          Register
        </router-link>
      </p>
    </div>
  </div>
</template>
