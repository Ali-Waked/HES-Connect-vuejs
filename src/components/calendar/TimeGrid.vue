<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import ScheduleEvent from './ScheduleEvent.vue'
import UnavailabilityEvent from './UnavailabilityEvent.vue'

const props = defineProps({
  weekDays: { type: Array, required: true },
  hours: { type: Array, required: true },
  startHour: { type: Number, default: 7 },
  endHour: { type: Number, default: 22 },
  schedules: { type: Array, default: () => [] },
  unavailabilities: { type: Array, default: () => [] },
  facilityColors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['clickSchedule', 'clickUnavailability'])

const scrollContainer = ref(null)

const rowHeight = 48
const totalRows = computed(() => (props.endHour - props.startHour) * 2)

function getScheduleForDay(dayOfWeek) {
  return props.schedules.filter(s => s.day_of_week === dayOfWeek)
}

function getUnavailabilityForDay(date) {
  return props.unavailabilities.filter(u => {
    const start = new Date(u.start_at)
    const end = new Date(u.end_at)
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    return start <= dayEnd && end >= dayStart
  })
}

function getSchedulePosition(schedule) {
  const [sh, sm] = schedule.start_time.split(':').map(Number)
  const [eh, em] = schedule.end_time.split(':').map(Number)
  const startMinutes = (sh - props.startHour) * 60 + sm
  const duration = (eh * 60 + em) - (sh * 60 + sm)
  const top = (startMinutes / 30) * (rowHeight / 2)
  const height = (duration / 30) * (rowHeight / 2)
  return { top, height: Math.max(24, height) }
}

function getUnavailabilityPosition(unavail) {
  const start = new Date(unavail.start_at)
  const end = new Date(unavail.end_at)
  const startMinutes = (start.getHours() - props.startHour) * 60 + start.getMinutes()
  const duration = (end.getTime() - start.getTime()) / 60000
  const top = (startMinutes / 30) * (rowHeight / 2)
  const height = (duration / 30) * (rowHeight / 2)
  return { top, height: Math.max(24, height) }
}

function scrollToNow() {
  if (!scrollContainer.value) return
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const targetMinute = (currentHour - props.startHour) * 60 + currentMinute
  const scrollTop = (targetMinute / 30) * (rowHeight / 2) - 100
  scrollContainer.value.scrollTop = Math.max(0, scrollTop)
}

function getCurrentTimeTop() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  if (h < props.startHour || h >= props.endHour) return -1
  const totalMinutes = (h - props.startHour) * 60 + m
  return (totalMinutes / 30) * (rowHeight / 2)
}

const currentTimeTop = computed(() => getCurrentTimeTop())

onMounted(() => {
  nextTick(() => scrollToNow())
})

defineExpose({ scrollToNow })
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <!-- Day headers -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 bg-white dark:bg-slate-900">
      <div class="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800"></div>
      <div
        v-for="day in weekDays"
        :key="day.name"
        class="flex-1 py-3 px-2 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0"
        :class="day.isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''"
      >
        <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {{ day.short }}
        </div>
        <div
          class="text-lg font-bold mt-0.5"
          :class="day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'"
        >
          {{ day.date.getDate() }}
        </div>
        <div
          v-if="day.isToday"
          class="w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full mx-auto mt-1"
        ></div>
      </div>
    </div>

    <!-- Time grid -->
    <div ref="scrollContainer" class="overflow-y-auto" style="max-height: calc(100vh - 280px);">
      <div class="flex relative">
        <!-- Time labels -->
        <div class="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800">
          <div
            v-for="hour in hours"
            :key="hour"
            class="relative border-b border-slate-100 dark:border-slate-800"
            :style="{ height: rowHeight + 'px' }"
          >
            <span class="absolute -top-2.5 right-3 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {{ String(hour).padStart(2, '0') }}:00
            </span>
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="day in weekDays"
          :key="day.name"
          class="flex-1 relative border-r border-slate-200 dark:border-slate-800 last:border-r-0"
          :class="day.isToday ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''"
        >
          <!-- Time rows -->
          <div
            v-for="hour in hours"
            :key="hour"
            class="border-b border-slate-100 dark:border-slate-800"
            :style="{ height: rowHeight + 'px' }"
          >
            <div class="h-px bg-slate-100 dark:bg-slate-800" :style="{ marginTop: rowHeight / 2 + 'px' }"></div>
          </div>

          <!-- Current time line -->
          <div
            v-if="day.isToday && currentTimeTop >= 0"
            class="absolute left-0 right-0 z-10 pointer-events-none"
            :style="{ top: currentTimeTop + 'px' }"
          >
            <div class="flex items-center">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5"></div>
              <div class="flex-1 h-px bg-red-500"></div>
            </div>
          </div>

          <!-- Schedule events -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="schedule in getScheduleForDay(day.dayOfWeek)"
              :key="'s-' + schedule.id"
              class="pointer-events-auto"
            >
              <ScheduleEvent
                :schedule="schedule"
                :color="facilityColors[schedule.facility?.uuid] || '#3B82F6'"
                :position="getSchedulePosition(schedule)"
                @click="emit('clickSchedule', $event)"
              />
            </div>
          </div>

          <!-- Unavailability events -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="unavail in getUnavailabilityForDay(day.date)"
              :key="'u-' + unavail.id"
              class="pointer-events-auto"
            >
              <UnavailabilityEvent
                :unavailability="unavail"
                :position="getUnavailabilityPosition(unavail)"
                @click="emit('clickUnavailability', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
