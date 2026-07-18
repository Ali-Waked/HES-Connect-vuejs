<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  schedules: { type: Object, default: () => ({}) },
})

const { locale } = useI18n()

const dayNames = {
  0: { en: 'Sunday', ar: 'الأحد', abbr: 'sun' },
  1: { en: 'Monday', ar: 'الإثنين', abbr: 'mon' },
  2: { en: 'Tuesday', ar: 'الثلاثاء', abbr: 'tue' },
  3: { en: 'Wednesday', ar: 'الأربعاء', abbr: 'wed' },
  4: { en: 'Thursday', ar: 'الخميس', abbr: 'thu' },
  5: { en: 'Friday', ar: 'الجمعة', abbr: 'fri' },
  6: { en: 'Saturday', ar: 'السبت', abbr: 'sat' },
}

const dayColors = {
  sun: 'bg-rose-50 text-rose-700 dark:bg-rose-900/15 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
  mon: 'bg-blue-50 text-blue-700 dark:bg-blue-900/15 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
  tue: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  wed: 'bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  thu: 'bg-purple-50 text-purple-700 dark:bg-purple-900/15 dark:text-purple-400 border-purple-200 dark:border-purple-800/40',
  fri: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/15 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40',
  sat: 'bg-pink-50 text-pink-700 dark:bg-pink-900/15 dark:text-pink-400 border-pink-200 dark:border-pink-800/40',
}

function dayLabel(num) {
  const d = dayNames[num]
  if (!d) return `Day ${num}`
  return locale.value === 'ar' ? d.ar : d.en
}

function dayColor(num) {
  const d = dayNames[num]
  return dayColors[d?.abbr] || 'bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400 border-slate-200 dark:border-slate-700'
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="dayNum in [0,1,2,3,4,5,6]" :key="dayNum" class="flex items-center gap-3">
      <span
        class="w-28 shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
        :class="dayColor(dayNum)"
      >
        {{ dayLabel(dayNum) }}
      </span>
      <template v-if="schedules[dayNum]">
        <div class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <svg class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span class="font-medium">{{ (schedules[dayNum].start_time || '').slice(0, 5) }} &ndash; {{ (schedules[dayNum].end_time || '').slice(0, 5) }}</span>
          <span class="text-slate-400 dark:text-slate-500">·</span>
          <span class="text-slate-500 dark:text-slate-400">{{ schedules[dayNum].slot_duration }} min slots</span>
        </div>
      </template>
      <span v-else class="text-sm text-slate-400 dark:text-slate-600 italic">Off</span>
    </div>
  </div>
</template>
