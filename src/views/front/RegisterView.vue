<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

async function handleRegister() {
  const result = await authStore.register(form)
  if (result.success) {
    router.push('/')
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
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">Create Account</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Join Health Garagantam today</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Your full name"
            class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:border-brand-primary rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition"
            :class="authStore.errors.name ? 'border-red-400' : ''"
          />
          <p v-if="authStore.errors.name" class="text-xs text-red-500">{{ authStore.errors.name[0] }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:border-brand-primary rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition"
            :class="authStore.errors.email ? 'border-red-400' : ''"
          />
          <p v-if="authStore.errors.email" class="text-xs text-red-500">{{ authStore.errors.email[0] }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="Min. 8 characters"
            class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:border-brand-primary rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition"
            :class="authStore.errors.password ? 'border-red-400' : ''"
          />
          <p v-if="authStore.errors.password" class="text-xs text-red-500">{{ authStore.errors.password[0] }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            required
            placeholder="Repeat your password"
            class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:border-brand-primary rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <svg v-if="authStore.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
        </button>

      </form>

      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?
        <router-link to="/login" class="text-brand-primary font-semibold hover:underline">
          Sign In
        </router-link>
      </p>
    </div>
  </div>
</template>
