<script setup>
defineProps({
  status: { type: String, required: true },
})

const config = {
  succeeded: { icon: 'check_circle', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  completed: { icon: 'check_circle', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  pending: { icon: 'schedule', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  processing: { icon: 'sync', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  failed: { icon: 'error', class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  refunded: { icon: 'undo', class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
    :class="config[status]?.class || 'bg-slate-100 text-slate-600'"
  >
    <span class="material-symbols-outlined text-sm">{{ config[status]?.icon || 'help' }}</span>
    {{ status }}
  </span>
</template>
