<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDonationFlowStore } from '@/stores/useDonationFlowStore'

import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const store = useDonationFlowStore()

function formatCurrency(val, currency = 'USD') {
  if (val == null) return ''
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return Number(val).toLocaleString(loc, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
  } catch {
    return `$${Number(val).toLocaleString()}`
  }
}

const statusConfig = computed(() => {
  const status = store.currentDonation?.status
  if (status === 'completed' || status === 'succeeded') {
    return {
      icon: 'check-circle',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      label: t('donationsFlow.completed'),
    }
  }
  if (status === 'failed' || status === 'refunded') {
    return {
      icon: 'x-circle',
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      label: t('donationsFlow.failed'),
    }
  }
  return {
    icon: 'clock',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    label: t('donationsFlow.pending'),
  }
})

function goToStory() {
  const storyId = store.currentDonation?.story_id || store.currentDonation?.story?.uuid
  if (storyId) {
    router.push(`/stories/${storyId}`)
  } else {
    router.push('/stories')
  }
}

function retryDonation() {
  const storyId = store.currentDonation?.story_id || store.currentDonation?.story?.uuid
  if (storyId) {
    router.push(`/stories/${storyId}`)
  }
}

onMounted(() => {
  const donationId = route.params.id
  if (donationId) {
    store.startPolling(donationId, 4000)
  }
})

onUnmounted(() => {
  store.stopPolling()
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="pt-32 pb-20 px-4">
      <div class="max-w-lg mx-auto">
        <div v-if="!store.currentDonation" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div class="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center animate-pulse">
            <svg class="w-6 h-6 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.loadingStatus') }}</p>
        </div>

        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="p-8 text-center space-y-4" :class="statusConfig.bg">
            <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center" :class="statusConfig.bg">
              <svg v-if="store.currentDonation.status === 'completed' || store.currentDonation.status === 'succeeded'" class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="store.currentDonation.status === 'failed' || store.currentDonation.status === 'refunded'" class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white" :class="statusConfig.color">{{ statusConfig.label }}</h1>
          </div>

          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.amount') }}</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(store.currentDonation.amount, store.currentDonation.currency || 'USD', locale) }}</span>
            </div>
            <div v-if="store.currentDonation.donor_name" class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.donor') }}</span>
              <span class="text-sm font-medium text-slate-900 dark:text-white">{{ store.currentDonation.donor_name }}</span>
            </div>
            <div v-if="store.currentDonation.message" class="py-3 border-b border-slate-100 dark:border-slate-700">
              <span class="text-sm text-slate-500 dark:text-slate-400 block mb-1">{{ t('donationsFlow.message') }}</span>
              <p class="text-sm text-slate-700 dark:text-slate-300 italic">&ldquo;{{ store.currentDonation.message }}&rdquo;</p>
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('donationsFlow.date') }}</span>
              <span class="text-sm text-slate-700 dark:text-slate-300">{{ new Date(store.currentDonation.created_at).toLocaleDateString() }}</span>
            </div>
          </div>

          <div v-if="store.statusPolling" class="px-6 pb-6">
            <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ t('donationsFlow.autoRefreshing') }}
            </div>
          </div>

          <div class="p-6 pt-0 flex flex-col gap-3">
            <button
              v-if="store.currentDonation.status === 'failed' || store.currentDonation.status === 'refunded'"
              class="w-full rounded-xl bg-brand-primary py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover cursor-pointer"
              @click="retryDonation"
            >
              {{ t('donationsFlow.retry') }}
            </button>
            <router-link
              :to="`/stories/${store.currentDonation.story_id || store.currentDonation.story?.uuid || ''}`"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {{ t('donationsFlow.backToStory') }}
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
