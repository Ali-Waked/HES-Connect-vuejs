<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="pt-32 pb-20 px-4">
      <div class="max-w-lg mx-auto">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.donationCancelled') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.donationCancelledDesc') }}</p>
          <div class="mt-6 flex flex-col gap-3">
            <router-link
              to="/stories"
              class="w-full rounded-xl bg-brand-primary py-3 text-sm font-bold text-white text-center transition hover:bg-brand-primary-hover"
            >
              {{ t('donationsFlow.retry') }}
            </router-link>
            <router-link
              to="/"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {{ t('donationsFlow.returnHome') }}
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
