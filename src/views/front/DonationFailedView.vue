<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const storyId = route.query.story_id
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="pt-32 pb-20 px-4">
      <div class="max-w-lg mx-auto">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.donationFailed') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.donationFailedDesc') }}</p>
          <div class="mt-6 flex flex-col gap-3">
            <router-link
              v-if="storyId"
              :to="`/stories/${storyId}`"
              class="w-full rounded-xl bg-brand-primary py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover text-center"
            >
              {{ t('donationsFlow.retry') }}
            </router-link>
            <router-link
              to="/stories"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {{ t('donationsFlow.browseStories') }}
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
