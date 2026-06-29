<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  donation: { type: Object, required: true },
})

const { t, locale } = useI18n()

function formatAmount(amount, currency = 'USD') {
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusColors = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  succeeded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
}
</script>

<template>
  <div class="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition hover:shadow-md hover:border-brand-primary/30">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-brand-primary text-xl">favorite</span>
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-slate-900 dark:text-white truncate">{{ donation.donor_name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ formatDate(donation.created_at) }}</p>
        </div>
      </div>
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
        :class="statusColors[donation.status] || 'bg-slate-100 text-slate-600'"
      >
        {{ donation.status }}
      </span>
    </div>

    <div class="mt-4 flex items-end justify-between">
      <div class="min-w-0">
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('donations.supporting') }}</p>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ donation.story_title }}</p>
      </div>
      <p class="text-xl font-bold text-brand-primary shrink-0">{{ formatAmount(donation.amount, donation.currency) }}</p>
    </div>

    <p v-if="donation.message" class="mt-3 text-sm text-slate-600 dark:text-slate-400 italic line-clamp-2">
      "{{ donation.message }}"
    </p>
  </div>
</template>
