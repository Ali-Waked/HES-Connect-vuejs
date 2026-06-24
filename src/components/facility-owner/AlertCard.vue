<script setup>
defineProps({
  alert: { type: Object, required: true }
})

const severityStyles = {
  high: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
  medium: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
  low: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
}

const typeIcons = {
  overbooked: 'group_add',
  unavailable: 'event_busy',
  'high-cancellation': 'trending_down'
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 p-4 transition hover:shadow-sm" :class="severityStyles[alert.severity] || severityStyles.low">
    <div class="flex items-start gap-3">
      <span class="material-symbols-outlined text-slate-400 mt-0.5">{{ typeIcons[alert.type] || 'warning' }}</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ alert.title }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ alert.message }}</p>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 mt-0.5" :class="{
        'text-red-600 bg-red-100/50 dark:bg-red-900/30 dark:text-red-400': alert.severity === 'high',
        'text-amber-600 bg-amber-100/50 dark:bg-amber-900/30 dark:text-amber-400': alert.severity === 'medium',
        'text-blue-600 bg-blue-100/50 dark:bg-blue-900/30 dark:text-blue-400': alert.severity === 'low'
      }">{{ alert.severity }}</span>
    </div>
  </div>
</template>
