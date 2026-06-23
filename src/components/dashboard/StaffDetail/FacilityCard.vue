<script setup>
import { useLocaleField } from '../../../composables/useLocaleField'
import BaseBadge from '../global/BaseBadge.vue'

defineProps({
  facility: { type: Object, required: true },
})

const { localField } = useLocaleField()
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
          </svg>
        </div>
        <div class="min-w-0">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ localField(facility, 'name') }}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Facility</p>
        </div>
      </div>
    </div>

    <div v-if="facility.role || facility.department" class="flex flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-slate-700">
      <BaseBadge v-if="facility.role" variant="info">
        {{ localField(facility.role, 'name') }}
      </BaseBadge>
      <BaseBadge v-if="facility.department" variant="success">
        {{ localField(facility.department, 'name') }}
      </BaseBadge>
    </div>
  </div>
</template>
