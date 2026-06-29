<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifyPayment } from '@/services/public/paymentService'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const status = ref('verifying')
const donation = ref(null)

function formatCurrency(val, currency = 'USD') {
  if (val == null) return ''
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return Number(val).toLocaleString(loc, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
  } catch {
    return `$${Number(val).toLocaleString()}`
  }
}

onMounted(async () => {
  const sessionId = route.query.session_id
  if (!sessionId) {
    status.value = 'error'
    return
  }
  try {
    const { data } = await verifyPayment(sessionId)
    donation.value = data.data || data
    status.value = donation.value?.status === 'completed' || donation.value?.status === 'succeeded' ? 'success' : 'pending'
  } catch {
    status.value = 'error'
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="pt-32 pb-20 px-4">
      <div class="max-w-lg mx-auto">
        <div v-if="status === 'verifying'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.verifying') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.verifyingDesc') }}</p>
        </div>

        <div v-else-if="status === 'success'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="bg-green-50 dark:bg-green-900/20 p-8 text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="mt-4 text-2xl font-extrabold text-green-700 dark:text-green-400">{{ t('donationsFlow.thankYou') }}</h1>
            <p class="mt-2 text-sm text-green-600 dark:text-green-300">{{ t('donationsFlow.thankYouDesc') }}</p>
          </div>

          <div v-if="donation" class="p-6 space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.amount') }}</span>
              <span class="text-lg font-bold text-brand-primary">{{ formatCurrency(donation.amount, donation.currency) }}</span>
            </div>
            <div v-if="donation.story_title" class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.story') }}</span>
              <span class="text-sm font-medium text-slate-900 dark:text-white text-right">{{ donation.story_title }}</span>
            </div>
            <div v-if="donation.message" class="py-3">
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">{{ t('donationsFlow.yourMessage') }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-300 italic">&ldquo;{{ donation.message }}&rdquo;</p>
            </div>
          </div>

          <div class="p-6 pt-0">
            <router-link
              :to="donation ? `/stories/${donation.story_id || donation.story?.uuid}` : '/stories'"
              class="block w-full rounded-xl bg-brand-primary py-3 text-sm font-bold text-white text-center transition hover:bg-brand-primary-hover"
            >
              {{ t('donationsFlow.backToStory') }}
            </router-link>
          </div>
        </div>

        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.verificationFailed') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.verificationFailedDesc') }}</p>
          <router-link to="/stories" class="inline-flex items-center gap-2 mt-6 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover">
            {{ t('donationsFlow.browseStories') }}
          </router-link>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
