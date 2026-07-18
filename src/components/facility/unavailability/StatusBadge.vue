<script setup>
defineProps({
  status: { type: String, default: 'pending' }
})

const statusConfig = {
  pending: {
    label: 'Pending',
    classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
    :class="statusConfig[status]?.classes || statusConfig.pending.classes"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[status]?.dot || statusConfig.pending.dot"></span>
    {{ statusConfig[status]?.label || status }}
  </span>
</template>
