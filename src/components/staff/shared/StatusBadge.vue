<script setup>
const props = defineProps({
  status: { type: String, required: true }
});

const styles = {
  booked: 'bg-blue-100/30 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100/30 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100/30 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  rescheduled: 'bg-amber-100/30 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  pending: 'bg-amber-100/30 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100/30 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100/30 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  published: 'bg-green-100/30 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending_review: 'bg-blue-100/30 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  low: 'bg-red-100/30 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100/30 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  good: 'bg-green-100/30 text-green-700 dark:bg-green-900/30 dark:text-green-400'
};

function label(value) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold" :class="styles[props.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">
    {{ label(props.status) }}
  </span>
</template>
