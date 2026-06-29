<script setup>
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

const { locale } = useI18n()

defineProps({
  email: { type: String, default: '' },
  emailVerifiedAt: { type: String, default: null },
  provider: { type: String, default: '' },
  createdAt: { type: String, default: '' },
})

function formatDate(date) {
  if (!date) return '—'
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return new Date(date).toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">Account</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Security and account details.</p>
    </div>

    <div class="p-6 space-y-4">
      <!-- Email -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</p>
            <p class="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{{ email || '—' }}</p>
          </div>
        </div>
        <span v-if="emailVerifiedAt"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verified
        </span>
        <span v-else
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          Unverified
        </span>
      </div>

      <!-- Provider -->
      <div v-if="provider" class="flex items-center gap-3 py-3 border-t border-slate-100 dark:border-slate-800">
        <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Provider</p>
          <p class="text-sm font-medium text-slate-900 dark:text-white mt-0.5 capitalize">{{ provider }}</p>
        </div>
      </div>

      <!-- Member Since -->
      <div class="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Member Since</p>
          <p class="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{{ formatDate(createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
