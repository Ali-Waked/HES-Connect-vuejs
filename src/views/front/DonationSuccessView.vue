<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { checkDonationStatus } from '@/services/public/paymentService'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const route = useRoute()
const { t, locale } = useI18n()

const status = ref('verifying')
const donation = ref(null)
const error = ref(null)

let pollTimer = null

function formatCurrency(val, currency = 'USD') {
  if (val == null) return ''
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return Number(val).toLocaleString(loc, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
  } catch {
    return `$${Number(val).toLocaleString()}`
  }
}

const terminalStatuses = ['completed', 'succeeded', 'expired', 'failed', 'cancelled']

function isTerminal(s) {
  return terminalStatuses.includes(s)
}

async function fetchStatus(sessionId) {
  try {
    const { data } = await checkDonationStatus(sessionId)
    const record = data.data || data
    donation.value = record
    const s = record?.status
    if (s === 'completed' || s === 'succeeded') {
      status.value = 'completed'
    } else if (s === 'expired') {
      status.value = 'expired'
    } else if (s === 'failed') {
      status.value = 'failed'
    } else if (s === 'cancelled') {
      status.value = 'cancelled'
    } else {
      status.value = 'pending'
    }
    return s
  } catch (e) {
    error.value = e?.response?.data?.message || e.message
    status.value = 'error'
    return null
  }
}

function startPolling(sessionId) {
  pollTimer = setInterval(async () => {
    const s = await fetchStatus(sessionId)
    if (s && isTerminal(s)) {
      stopPolling()
    }
  }, 2500)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(async () => {
  const sessionId = route.query.session_id
  if (!sessionId) {
    status.value = 'error'
    return
  }
  const s = await fetchStatus(sessionId)
  if (s && !isTerminal(s)) {
    startPolling(sessionId)
  }
})

onBeforeUnmount(() => {
  stopPolling()
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

        <div v-else-if="status === 'pending'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="bg-amber-50 dark:bg-amber-900/20 p-8 text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <svg class="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.pending') }}</h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.pendingDesc') }}</p>
          </div>
          <div class="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
            <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ t('donationsFlow.autoRefreshing') }}
          </div>
        </div>

        <div v-else-if="status === 'completed'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-8 pt-10 pb-6 text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200/50 dark:shadow-green-900/30">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">{{ t('donationsFlow.thankYou') }}</h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{{ t('donationsFlow.thankYouDesc') }}</p>
          </div>

          <div v-if="donation" class="px-8 pb-2">
            <div v-if="donation.story_title" class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{{ t('donationsFlow.story') }}</p>
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ donation.story_title }}</p>
            </div>
            <div v-if="donation.message" class="mt-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/20">
              <p class="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">{{ t('donationsFlow.yourMessage') }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-300 italic">&ldquo;{{ donation.message }}&rdquo;</p>
            </div>
          </div>

          <div class="px-8 pb-8 pt-2 flex flex-col gap-3">
            <router-link
              :to="donation ? `/stories/${donation.story_id || donation.story?.uuid}` : '/stories'"
              class="group inline-flex items-center justify-center gap-2 w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-brand-primary/30"
            >
              {{ t('donationsFlow.backToStories') }}
              <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </router-link>
          </div>
        </div>

        <div v-else-if="status === 'expired'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.expired') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.expiredDesc') }}</p>
          <router-link to="/stories" class="inline-flex items-center gap-2 mt-6 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover">
            {{ t('donationsFlow.browseStories') }}
          </router-link>
        </div>

        <div v-else-if="status === 'failed'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.donationFailed') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.donationFailedDesc') }}</p>
          <div class="mt-6 flex flex-col gap-3">
            <router-link
              v-if="donation?.story_id || donation?.story?.uuid"
              :to="`/stories/${donation.story_id || donation.story.uuid}`"
              class="w-full rounded-xl bg-brand-primary py-3 text-sm font-bold text-white text-center transition hover:bg-brand-primary-hover"
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

        <div v-else-if="status === 'cancelled'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.donationCancelled') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.donationCancelledDesc') }}</p>
          <div class="mt-6 flex flex-col gap-3">
            <router-link
              v-if="donation?.story_id || donation?.story?.uuid"
              :to="`/stories/${donation.story_id || donation.story.uuid}`"
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

        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">{{ t('donationsFlow.verificationFailed') }}</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.verificationFailedDesc') }}</p>
          <p v-if="error" class="mt-2 text-xs text-red-400">{{ error }}</p>
          <router-link to="/stories" class="inline-flex items-center gap-2 mt-6 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover">
            {{ t('donationsFlow.browseStories') }}
          </router-link>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
