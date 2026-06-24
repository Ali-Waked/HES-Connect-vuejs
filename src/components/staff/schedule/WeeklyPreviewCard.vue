<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const { t, locale } = useI18n()

const props = defineProps({
  schedules: { type: Array, default: () => [] },
  unavailability: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const events = computed(() => {
  const result = []

  props.schedules.forEach(s => {
    const dayIndex = s.day_of_week !== undefined ? s.day_of_week : weekDays.indexOf((s.day_name || '').toLowerCase())
    if (dayIndex === -1) return
    const active = s.is_active !== false
    const st = s.start_time || s.startTime || '09:00'
    const et = s.end_time || s.endTime || '17:00'
    const facilityName = s.facility_name || ''
    result.push({
      daysOfWeek: [dayIndex],
      startTime: st,
      endTime: et,
      title: `${formatTime(st)} – ${formatTime(et)}`,
      backgroundColor: active ? '#10b981' : '#94a3b8',
      borderColor: active ? '#059669' : '#64748b',
      textColor: '#ffffff',
      extendedProps: { type: 'work', facility_name: facilityName, start_time: st, end_time: et },
    })
  })

  props.unavailability.forEach(u => {
    const from = new Date(u.date_from || u.dateFrom)
    const to = new Date(u.date_to || u.dateTo)
    const startTime = u.start_time || u.startTime || '00:00'
    const endTime = u.end_time || u.endTime || '23:59'

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      result.push({
        start: dateStr + 'T' + startTime,
        end: dateStr + 'T' + endTime,
        title: u.reason || t('schedule.unavailable'),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: { type: 'unavailable' },
      })
    }
  })

  return result
})

const calendarOptions = computed(() => ({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridWeek,timeGridDay',
  },
  events: events.value,
  height: 'auto',
  locale: locale.value === 'ar' ? 'ar' : 'en',
  firstDay: 1,
  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',
  allDaySlot: false,
  buttonText: {
    today: t('schedule.today'),
    week: t('common.week') || 'Week',
    day: t('common.day') || 'Day',
  },
  eventDidMount: (info) => {
    const el = info.el
    const ext = info.event.extendedProps
    if (ext.type === 'work') {
      const tip = ext.facility_name
        ? `${ext.facility_name} · ${formatTime(ext.start_time)} – ${formatTime(ext.end_time)}`
        : `${formatTime(ext.start_time)} – ${formatTime(ext.end_time)}`
      el.title = tip
    }
  },
  eventContent: (info) => {
    const type = info.event.extendedProps.type
    const dotColor = type === 'work' ? '#10b981' : type === 'unavailable' ? '#ef4444' : '#3b82f6'
    return {
      html: `<div style="display:flex;align-items:center;gap:4px;padding:1px 4px;font-size:11px;font-weight:600;">
        <span style="width:6px;height:6px;border-radius:50%;background:${dotColor};flex-shrink:0;"></span>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${info.event.title}</span>
      </div>`
    }
  },
}))

const empty = computed(() => !props.loading && events.value.length === 0)
</script>

<template>
  <div class="card-base p-5 sm:p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('schedule.weeklyPreviewTitle') }}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('schedule.weeklyPreviewDescription') }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-4 mb-4 text-xs text-slate-500 dark:text-slate-400">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        {{ t('schedule.legendAvailable') }}
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
        {{ t('schedule.legendUnavailable') }}
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        {{ t('schedule.legendBooked') }}
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="w-6 h-6 text-brand-primary animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>

    <FullCalendar
      v-else
      :options="calendarOptions"
      class="fullcalendar-container"
      :class="locale === 'ar' ? 'fc-direction-rtl' : ''"
      key="fullcalendar"
    />

    <div v-if="empty" class="empty-state py-10">
      <div class="empty-state-icon">
        <span class="material-symbols-outlined empty-state-icon-svg">calendar_view_week</span>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('schedule.noSchedules') }}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('schedule.weeklyPreviewDescription') }}</p>
    </div>
  </div>
</template>

<style scoped>
.fullcalendar-container :deep(.fc) {
  --fc-border-color: #e2e8f0;
  --fc-button-text-color: #475569;
  --fc-button-bg-color: #ffffff;
  --fc-button-border-color: #e2e8f0;
  --fc-button-hover-bg-color: #f8fafc;
  --fc-button-hover-border-color: #cbd5e1;
  --fc-button-active-bg-color: #f1f5f9;
  --fc-today-bg-color: rgba(2, 122, 117, 0.05);
  --fc-page-bg-color: #ffffff;
  --fc-neutral-bg-color: #f8fafc;
  --fc-list-event-hover-bg-color: #f1f5f9;
  font-size: 0.85rem;
}

.fullcalendar-container :deep(.fc .fc-toolbar-title) {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.fullcalendar-container :deep(.fc .fc-button) {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  text-transform: capitalize;
  box-shadow: none;
}

.fullcalendar-container :deep(.fc .fc-button-primary:not(:disabled).fc-button-active) {
  background-color: #027a75;
  border-color: #027a75;
  color: #ffffff;
}

.fullcalendar-container :deep(.fc .fc-button-primary:not(:disabled):hover) {
  background-color: #f8fafc;
}

.fullcalendar-container :deep(.fc .fc-button-primary:not(:disabled).fc-button-active:hover) {
  background-color: #026a66;
}

.fullcalendar-container :deep(.fc .fc-col-header-cell-cushion) {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0.25rem;
}

.fullcalendar-container :deep(.fc .fc-timegrid-slot) {
  height: 2rem;
}

.fullcalendar-container :deep(.fc .fc-timegrid-axis-cushion) {
  font-size: 0.7rem;
  color: #94a3b8;
}

.fullcalendar-container :deep(.fc .fc-event) {
  border-radius: 4px;
  border-width: 1px;
  font-size: 0.75rem;
}

.dark .fullcalendar-container :deep(.fc) {
  --fc-border-color: #334155;
  --fc-button-text-color: #cbd5e1;
  --fc-button-bg-color: #1e293b;
  --fc-button-border-color: #334155;
  --fc-button-hover-bg-color: #334155;
  --fc-button-hover-border-color: #475569;
  --fc-today-bg-color: rgba(2, 122, 117, 0.15);
  --fc-page-bg-color: #0f172a;
  --fc-neutral-bg-color: #1e293b;
  --fc-list-event-hover-bg-color: #1e293b;
}

.dark .fullcalendar-container :deep(.fc .fc-toolbar-title) {
  color: #f1f5f9;
}

.dark .fullcalendar-container :deep(.fc .fc-col-header-cell-cushion) {
  color: #64748b;
}

.dark .fullcalendar-container :deep(.fc .fc-timegrid-axis-cushion) {
  color: #64748b;
}
</style>
