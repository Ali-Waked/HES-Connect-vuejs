<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center">
      <div class="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-8">
        <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>

      <h1 class="text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-2">404</h1>
      <h2 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">{{ t('errors.notFound.title') }}</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
        {{ t('errors.notFound.description') }}
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          class="px-6 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20 cursor-pointer"
          @click="router.push(authStore.dashboardRoute || '/')"
        >
          {{ t('errors.notFound.goHome') }}
        </button>
        <button
          class="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          @click="router.back()"
        >
          {{ t('errors.notFound.goBack') }}
        </button>
      </div>
    </div>
  </div>
</template>
