<script setup>
defineProps({
  days: { type: Array, default: () => [] }
})

const dayColors = {
  sun: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  mon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tue: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  wed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  thu: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  fri: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  sat: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

const dayLabels = {
  sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat',
}

function getDayColor(day) {
  const key = day?.toLowerCase()?.substring(0, 3)
  return dayColors[key] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

function getDayLabel(day) {
  const key = day?.toLowerCase()?.substring(0, 3)
  return dayLabels[key] || day
}
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <span
      v-for="day in days"
      :key="day"
      class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
      :class="getDayColor(day)"
    >
      {{ getDayLabel(day) }}
    </span>
    <span v-if="!days || days.length === 0" class="text-xs text-slate-400">—</span>
  </div>
</template>
