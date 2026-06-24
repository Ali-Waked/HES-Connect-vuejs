<script setup>
import { computed } from 'vue'

const props = defineProps({
  schedules: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const doctorColors = computed(() => {
  const map = {}
  const palette = [
    'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
    'bg-blue-100/50 text-blue-700 border-blue-300/40',
    'bg-purple-100/50 text-purple-700 border-purple-300/40',
    'bg-amber-100/50 text-amber-700 border-amber-300/40',
    'bg-green-100/50 text-green-700 border-green-300/40'
  ]
  let i = 0
  for (const s of props.schedules) {
    if (!map[s.doctor]) map[s.doctor] = palette[i++ % palette.length]
  }
  return map
})

const scheduleByDay = computed(() => {
  const map = {}
  for (const day of days) map[day] = []
  for (const s of props.schedules) {
    if (map[s.day]) map[s.day].push(s)
  }
  return map
})
</script>

<template>
  <div class="card-base overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-brand-primary text-lg">calendar_month</span>
        Weekly Schedule
      </h3>
    </div>

    <div v-if="loading" class="p-5 space-y-3">
      <div v-for="i in 5" :key="i" class="h-10 skeleton-shimmer rounded-lg"></div>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="bg-slate-50/50 dark:bg-slate-900/50">
            <th class="sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 px-3 py-2.5 font-bold text-slate-400 uppercase tracking-wider w-20">Time</th>
            <th v-for="day in days" :key="day" class="px-3 py-2.5 font-bold text-slate-400 uppercase tracking-wider min-w-[120px]">{{ day.slice(0, 3) }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
          <tr v-for="hour in hours" :key="hour" class="hover:bg-slate-50/30 dark:hover:bg-slate-800/30">
            <td class="sticky left-0 bg-white dark:bg-slate-800 z-10 px-3 py-2.5 font-semibold text-slate-500">{{ hour }}</td>
            <td v-for="day in days" :key="day" class="px-3 py-1.5 align-top">
              <div
                v-for="sched in scheduleByDay[day].filter(s => s.start <= hour && s.end > hour)"
                :key="sched.id"
                class="rounded-md border px-2 py-1 text-[10px] font-bold leading-tight mb-1"
                :class="doctorColors[sched.doctor] || 'bg-slate-100 text-slate-600 border-slate-200'"
              >
                {{ sched.doctor.replace('Dr. ', '') }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
