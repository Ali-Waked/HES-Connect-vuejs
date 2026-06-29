<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: '' },
  trend: { type: String, default: '' },
  trendUp: { type: Boolean, default: true },
  color: { type: String, default: 'primary' },
})

const colorMap = {
  primary: 'text-brand-primary bg-brand-primary/10',
  success: 'text-emerald-600 bg-emerald-50',
  danger: 'text-rose-600 bg-rose-50',
  warning: 'text-amber-600 bg-amber-50',
  info: 'text-blue-600 bg-blue-50',
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4 transition-colors">
    <div v-if="icon" class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" :class="colorMap[color]">
      <span class="material-symbols-outlined text-2xl">{{ icon }}</span>
    </div>
    <div class="min-w-0">
      <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{{ title }}</p>
      <div class="flex items-baseline gap-2">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white truncate">{{ value }}</h3>
        <span
          v-if="trend"
          class="text-xs font-bold flex items-center"
          :class="trendUp ? 'text-emerald-600' : 'text-rose-600'"
        >
          <span class="material-symbols-outlined text-sm">{{ trendUp ? 'trending_up' : 'trending_down' }}</span>
          {{ trend }}
        </span>
      </div>
    </div>
  </div>
