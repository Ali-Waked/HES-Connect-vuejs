<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@/stores/workspace'
import { resolveTranslatedValue, getNameInitial } from '@/utils/locale'
import {
  getAppointments,
  getAppointmentAnalytics,
  getAppointmentStats,
  getAppointmentCalendar,
} from '@/services/appointmentService'
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue'
import BaseTable from '@/components/dashboard/global/BaseTable.vue'
import BasePagination from '@/components/dashboard/global/BasePagination.vue'
import BaseSearch from '@/components/dashboard/global/BaseSearch.vue'
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'
import BaseBadge from '@/components/dashboard/global/BaseBadge.vue'
import ChartWrapper from '@/components/facility-owner/ChartWrapper.vue'

const { t, locale } = useI18n()
const workspaceStore = useWorkspaceStore()

const loading = ref(false)
const error = ref(null)
const analyticsLoading = ref(false)
const statsLoading = ref(false)
const calendarLoading = ref(false)

const analytics = ref({
  total_appointments: 0,
  scheduled: 0,
  completed: 0,
  cancelled: 0,
  no_show: 0,
  completion_rate: 0,
  cancellation_rate: 0,
  active_facilities: 0,
})

const statsData = ref({
  by_status: [],
  facility_performance: [],
  doctor_performance: [],
  most_active_facilities: [],
  most_active_doctors: [],
})

const calendarEvents = ref([])
const calendarView = ref('month')
const calendarDate = ref(new Date())
const selectedCalEvent = ref(null)

const appointments = ref([])
const currentPage = ref(1)
const lastPage = ref(1)
const totalItems = ref(0)
const perPage = ref(15)
const searchQuery = ref('')
const statusFilter = ref('')
const facilityFilter = ref('')
const doctorFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const selectedAppointment = ref(null)
const showDetailModal = ref(false)
const actionLoading = ref(false)

const statuses = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']

const statusVariant = (s) => {
  const map = {
    scheduled: 'info',
    confirmed: 'primary',
    checked_in: 'warning',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'danger',
    rescheduled: 'warning',
  }
  return map[s] || 'neutral'
}

function statusLabel(s) {
  if (!s) return ''
  const key = 'statuses.' + s
  const translated = t(key)
  if (translated && translated !== key) return translated
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function safeName(val) {
  return resolveTranslatedValue(val) || '—'
}

function dateLocale() {
  return locale.value === 'ar' ? 'ar-SA' : 'en-US'
}

function formatDateTime(val) {
  if (!val) return '—'
  return new Date(val.replace(' ', 'T')).toLocaleString(dateLocale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateOnly(val) {
  if (!val) return '—'
  return new Date(val.replace(' ', 'T')).toLocaleDateString(dateLocale(), { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeOnly(val) {
  if (!val) return '—'
  return new Date(val.replace(' ', 'T')).toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit', hour12: true })
}

let searchTimeout = null
function onSearchInput(val) {
  searchQuery.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { currentPage.value = 1; fetchAppointments() }, 400)
}

function formatFilterDate(d) {
  if (!d) return undefined
  return d
}

const filterParams = computed(() => {
  const params = { page: currentPage.value, per_page: perPage.value }
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  if (statusFilter.value) params.status = statusFilter.value
  if (facilityFilter.value.trim()) params.facility = facilityFilter.value.trim()
  if (doctorFilter.value.trim()) params.doctor = doctorFilter.value.trim()
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  return params
})

const analyticsCards = computed(() => [
  { title: t('appointments.totalAppointments') || 'Total Appointments', value: analytics.value.total_appointments.toLocaleString(), icon: 'calendar_month', color: 'primary' },
  { title: t('appointments.scheduled') || 'Scheduled', value: analytics.value.scheduled.toLocaleString(), icon: 'schedule', color: 'info' },
  { title: t('appointments.completed') || 'Completed', value: analytics.value.completed.toLocaleString(), icon: 'check_circle', color: 'success' },
  { title: t('appointments.cancelled') || 'Cancelled', value: analytics.value.cancelled.toLocaleString(), icon: 'cancel', color: 'danger' },
  { title: t('appointments.noShow') || 'No Show', value: analytics.value.no_show.toLocaleString(), icon: 'event_busy', color: 'danger' },
  { title: t('appointments.completionRate') || 'Completion Rate', value: `${analytics.value.completion_rate}%`, icon: 'trending_up', color: 'success' },
  { title: t('appointments.cancellationRate') || 'Cancellation Rate', value: `${analytics.value.cancellation_rate}%`, icon: 'trending_down', color: 'warning' },
  { title: t('appointments.activeFacilities') || 'Active Facilities', value: analytics.value.active_facilities.toLocaleString(), icon: 'home_health', color: 'primary' },
])

const statusChartData = computed(() => ({
  labels: statsData.value.by_status.map((d) => statusLabel(d.status)),
  datasets: [
    {
      data: statsData.value.by_status.map((d) => d.count || 0),
      backgroundColor: ['#3b82f6', '#027a75', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#64748b', '#f97316'],
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}))

const statusChartOptions = {
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 16, usePointStyle: true, color: '#64748b', font: { size: 11 } },
    },
  },
}

const facilityChartData = computed(() => ({
  labels: statsData.value.facility_performance.slice(0, 8).map((d) => safeName(d.facility?.name)),
  datasets: [
    {
      label: t('appointments.title') || 'Appointments',
      data: statsData.value.facility_performance.slice(0, 8).map((d) => d.appointments_count || 0),
      backgroundColor: 'rgba(2, 122, 117, 0.7)',
      borderColor: '#027a75',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const facilityChartOptions = {
  indexAxis: 'y',
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
  },
}

const doctorChartData = computed(() => ({
  labels: statsData.value.doctor_performance.slice(0, 10).map((d) => safeName(d.doctor?.name)),
  datasets: [
    {
      label: t('appointments.title') || 'Appointments',
      data: statsData.value.doctor_performance.slice(0, 10).map((d) => d.appointments_count || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const doctorChartOptions = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } },
  },
}

const activeFacilityChartData = computed(() => ({
  labels: statsData.value.most_active_facilities.slice(0, 8).map((d) => safeName(d.facility?.name || d.name)),
  datasets: [
    {
      label: t('appointments.title') || 'Appointments',
      data: statsData.value.most_active_facilities.slice(0, 8).map((d) => d.count || d.appointments_count || 0),
      backgroundColor: 'rgba(245, 158, 11, 0.7)',
      borderColor: '#f59e0b',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const activeFacilityChartOptions = {
  indexAxis: 'y',
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
  },
}

const activeDoctorChartData = computed(() => ({
  labels: statsData.value.most_active_doctors.slice(0, 10).map((d) => safeName(d.doctor?.name || d.name)),
  datasets: [
    {
      label: t('appointments.title') || 'Appointments',
      data: statsData.value.most_active_doctors.slice(0, 10).map((d) => d.count || d.appointments_count || 0),
      backgroundColor: 'rgba(139, 92, 246, 0.7)',
      borderColor: '#8b5cf6',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const activeDoctorChartOptions = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } },
  },
}

const tableColumns = computed(() => [
  { key: 'uuid', label: t('appointments.id') || 'Appointment ID', width: '140px' },
  { key: 'patient', label: t('appointments.patient') || 'Patient' },
  { key: 'doctor', label: t('appointments.doctor') || 'Doctor' },
  { key: 'facility', label: t('appointments.facility') || 'Facility' },
  { key: 'date', label: t('appointments.date') || 'Appointment Date', width: '140px' },
  { key: 'start_time', label: t('appointments.startTime') || 'Start Time', width: '110px' },
  { key: 'end_time', label: t('appointments.endTime') || 'End Time', width: '110px' },
  { key: 'status', label: t('appointments.status') || 'Status', width: '130px' },
  { key: 'created_at', label: t('appointments.createdAt') || 'Created At', width: '140px' },
  { key: 'actions', label: t('appointments.actions') || 'Actions', align: 'right', width: '100px' },
])

async function fetchAnalytics() {
  analyticsLoading.value = true
  try {
    const { data } = await getAppointmentAnalytics()
    const d = data.data || data
    analytics.value = {
      total_appointments: d.total_appointments || 0,
      scheduled: d.scheduled || 0,
      completed: d.completed || 0,
      cancelled: d.cancelled || 0,
      no_show: d.no_show || 0,
      completion_rate: d.completion_rate || 0,
      cancellation_rate: d.cancellation_rate || 0,
      active_facilities: d.active_facilities || 0,
    }
  } catch {
    analytics.value = { total_appointments: 0, scheduled: 0, completed: 0, cancelled: 0, no_show: 0, completion_rate: 0, cancellation_rate: 0, active_facilities: 0 }
  } finally {
    analyticsLoading.value = false
  }
}

async function fetchStats() {
  statsLoading.value = true
  try {
    const { data } = await getAppointmentStats()
    const d = data.data || data
    statsData.value = {
      by_status: d.by_status || d.status_distribution || [],
      facility_performance: d.facility_performance || [],
      doctor_performance: d.doctor_performance || [],
      most_active_facilities: d.most_active_facilities || [],
      most_active_doctors: d.most_active_doctors || [],
    }
  } catch {
    statsData.value = { by_status: [], facility_performance: [], doctor_performance: [], most_active_facilities: [], most_active_doctors: [] }
  } finally {
    statsLoading.value = false
  }
}

function getCalendarRange() {
  const d = new Date(calendarDate.value)
  const y = d.getFullYear()
  const m = d.getMonth()
  let start, end
  if (calendarView.value === 'month') {
    start = new Date(y, m, 1)
    end = new Date(y, m + 1, 0)
  } else if (calendarView.value === 'week') {
    const day = d.getDay()
    start = new Date(d)
    start.setDate(d.getDate() - day)
    end = new Date(start)
    end.setDate(start.getDate() + 6)
  } else {
    start = new Date(y, m, d.getDate())
    end = new Date(y, m, d.getDate())
  }
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  }
}

async function fetchCalendar() {
  calendarLoading.value = true
  try {
    const range = getCalendarRange()
    const { data } = await getAppointmentCalendar({ ...range, view: calendarView.value })
    const raw = data.data || data
    if (Array.isArray(raw)) {
      calendarEvents.value = raw
    } else if (raw?.appointments && Array.isArray(raw.appointments)) {
      calendarEvents.value = raw.appointments
    } else if (raw?.events && Array.isArray(raw.events)) {
      calendarEvents.value = raw.events
    } else if (raw?.data && Array.isArray(raw.data)) {
      calendarEvents.value = raw.data
    } else {
      calendarEvents.value = []
    }
  } catch {
    calendarEvents.value = []
  } finally {
    calendarLoading.value = false
  }
}

async function fetchAppointments() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getAppointments(filterParams.value)
    const d = data.data || data
    appointments.value = Array.isArray(d) ? d : d.data || []
    if (data.meta) {
      currentPage.value = data.meta.current_page || 1
      lastPage.value = data.meta.last_page || 1
      totalItems.value = data.meta.total || 0
      perPage.value = data.meta.per_page || 15
    }
  } catch (err) {
    error.value = err.response?.data?.message || t('appointments.failedToLoad') || 'Failed to load appointments'
    appointments.value = []
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  currentPage.value = page
  fetchAppointments()
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  facilityFilter.value = ''
  doctorFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
  fetchAppointments()
}

const hasActiveFilters = computed(() => searchQuery.value || statusFilter.value || facilityFilter.value || doctorFilter.value || dateFrom.value || dateTo.value)

function viewDetails(appt) {
  selectedAppointment.value = appt
  showDetailModal.value = true
}

function closeDetail() {
  showDetailModal.value = false
  selectedAppointment.value = null
}

function viewCalendarEvent(ev) {
  selectedCalEvent.value = ev
  selectedAppointment.value = ev
  showDetailModal.value = true
}

function calendarPrev() {
  const d = new Date(calendarDate.value)
  if (calendarView.value === 'month') d.setMonth(d.getMonth() - 1)
  else if (calendarView.value === 'week') d.setDate(d.getDate() - 7)
  else d.setDate(d.getDate() - 1)
  calendarDate.value = d
  fetchCalendar()
}

function calendarNext() {
  const d = new Date(calendarDate.value)
  if (calendarView.value === 'month') d.setMonth(d.getMonth() + 1)
  else if (calendarView.value === 'week') d.setDate(d.getDate() + 7)
  else d.setDate(d.getDate() + 1)
  calendarDate.value = d
  fetchCalendar()
}

function calendarToday() {
  calendarDate.value = new Date()
  fetchCalendar()
}

function setCalendarView(view) {
  calendarView.value = view
  fetchCalendar()
}

const calendarTitle = computed(() => {
  const d = calendarDate.value
  const opts = { month: 'long', year: 'numeric' }
  const loc = dateLocale()
  const monthYear = d.toLocaleDateString(loc, opts)
  if (calendarView.value === 'day') {
    return d.toLocaleDateString(loc, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
  if (calendarView.value === 'week') {
    const range = getCalendarRange()
    return `${formatDateOnly(range.start_date)} — ${formatDateOnly(range.end_date)}`
  }
  return monthYear
})

function getDayNames() {
  const loc = dateLocale()
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 0, i + 1)
    days.push(d.toLocaleDateString(loc, { weekday: 'short' }))
  }
  return days
}
const dayNames = getDayNames()

const calendarGrid = computed(() => {
  const d = new Date(calendarDate.value)
  const y = d.getFullYear()
  const m = d.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, date: null, events: [], empty: true })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = calendarEvents.value.filter((ev) => {
      const evDate = ev.start_at ? ev.start_at.split(' ')[0] : ''
      return evDate === dateStr
    })
    cells.push({ day, date: dateStr, events: dayEvents, isToday: dateStr === todayStr })
  }
  return cells
})

const weekDays = computed(() => {
  const range = getCalendarRange()
  const days = []
  const start = new Date(range.start_date)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayEvents = calendarEvents.value.filter((ev) => {
      const evDate = ev.start_at ? ev.start_at.split(' ')[0] : ''
      return evDate === dateStr
    })
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    days.push({ date: dateStr, dayName: dayNames[d.getDay()], dayNum: d.getDate(), events: dayEvents, isToday: dateStr === todayStr })
  }
  return days
})

const dayEvents = computed(() => {
  const range = getCalendarRange()
  return calendarEvents.value
    .filter((ev) => {
      const evDate = ev.start_at ? ev.start_at.split(' ')[0] : ''
      return evDate === range.start_date
    })
    .sort((a, b) => {
      if (a.start_at < b.start_at) return -1
      if (a.start_at > b.start_at) return 1
      return 0
    })
})

function statusDot(s) {
  const map = {
    scheduled: 'bg-blue-400',
    confirmed: 'bg-brand-primary',
    checked_in: 'bg-amber-400',
    in_progress: 'bg-amber-500',
    completed: 'bg-emerald-400',
    cancelled: 'bg-red-400',
    no_show: 'bg-red-500',
    rescheduled: 'bg-amber-400',
  }
  return map[s] || 'bg-slate-400'
}

function getAppointmentId(appt) {
  return appt.uuid ? appt.uuid.split('-')[0] : (appt.id || '—')
}

onMounted(async () => {
  await Promise.all([fetchAnalytics(), fetchStats(), fetchCalendar(), fetchAppointments()])
})

watch(() => workspaceStore.currentWorkspaceId, () => {
  currentPage.value = 1
  calendarDate.value = new Date()
  Promise.all([fetchAnalytics(), fetchStats(), fetchCalendar(), fetchAppointments()])
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('appointments.title') || 'Appointments' }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('appointments.description') || 'Monitor and manage all appointments across the platform' }}</p>
      </div>
    </div>

    <div v-if="analyticsLoading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse">
        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 mb-4"></div>
        <div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded mb-2"></div>
        <div class="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatisticsCard v-for="card in analyticsCards" :key="card.title" v-bind="card" />
    </div>

    <div v-if="statsLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 animate-pulse">
        <div class="h-5 w-40 bg-slate-100 dark:bg-slate-700 rounded mb-6"></div>
        <div class="h-48 bg-slate-100 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ $t('appointments.byStatus') || 'Appointments by Status' }}</h3>
        <ChartWrapper v-if="statsData.by_status.length > 0" type="doughnut" :data="statusChartData" :options="statusChartOptions" height="h-56" />
        <div v-else class="h-56 flex items-center justify-center text-sm text-slate-400">{{ $t('appointments.noData') || 'No data available' }}</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ $t('appointments.facilityPerformance') || 'Facility Performance' }}</h3>
        <ChartWrapper v-if="statsData.facility_performance.length > 0" type="bar" :data="facilityChartData" :options="facilityChartOptions" height="h-56" />
        <div v-else class="h-56 flex items-center justify-center text-sm text-slate-400">{{ $t('appointments.noData') || 'No data available' }}</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ $t('appointments.mostActiveFacilities') || 'Most Active Facilities' }}</h3>
        <ChartWrapper v-if="statsData.most_active_facilities.length > 0" type="bar" :data="activeFacilityChartData" :options="activeFacilityChartOptions" height="h-56" />
        <div v-else class="h-56 flex items-center justify-center text-sm text-slate-400">{{ $t('appointments.noData') || 'No data available' }}</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ $t('appointments.mostActiveDoctors') || 'Most Active Doctors' }}</h3>
        <ChartWrapper v-if="statsData.most_active_doctors.length > 0" type="bar" :data="activeDoctorChartData" :options="activeDoctorChartOptions" height="h-56" />
        <div v-else class="h-56 flex items-center justify-center text-sm text-slate-400">{{ $t('appointments.noData') || 'No data available' }}</div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ $t('appointments.calendar') || 'Calendar' }}</h3>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              v-for="view in ['day', 'week', 'month']" :key="view"
              class="px-3 py-1.5 text-xs font-bold rounded-md capitalize transition cursor-pointer"
              :class="calendarView === view ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
              @click="setCalendarView(view)"
            >{{ view }}</button>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition cursor-pointer" @click="calendarPrev">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white min-w-[200px] text-center">{{ calendarTitle }}</h4>
          <button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition cursor-pointer" @click="calendarNext">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        <button class="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 rounded-lg transition cursor-pointer" @click="calendarToday">{{ $t('appointments.today') || 'Today' }}</button>
      </div>

      <div v-if="calendarLoading" class="h-64 flex items-center justify-center">
        <div class="w-8 h-8 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin"></div>
      </div>

      <template v-else-if="calendarView === 'month'">
        <div class="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
          <div v-for="dn in dayNames" :key="dn" class="bg-slate-50 dark:bg-slate-800/50 px-2 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center tracking-wider">{{ dn }}</div>
          <div
            v-for="(cell, idx) in calendarGrid" :key="idx"
            class="bg-white dark:bg-slate-800 min-h-[80px] p-1.5 transition-colors"
            :class="{ 'bg-slate-50/50 dark:bg-slate-800/50': cell.empty }"
          >
            <div v-if="cell.day" class="space-y-1">
              <span
                class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full"
                :class="cell.isToday ? 'bg-brand-primary text-white' : 'text-slate-700 dark:text-slate-300'"
              >{{ cell.day }}</span>
              <div class="space-y-0.5">
                <div
                  v-for="ev in cell.events.slice(0, 3)" :key="ev.uuid || ev.id"
                  class="flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  @click="viewCalendarEvent(ev)"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDot(ev.status)"></span>
                  <span class="text-[10px] text-slate-600 dark:text-slate-400 truncate leading-tight">{{ safeName(ev.patient?.name) }}</span>
                </div>
                <div v-if="cell.events.length > 3" class="text-[10px] text-brand-primary font-bold px-1">+{{ cell.events.length - 3 }} {{ $t('appointments.more') || 'more' }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="calendarView === 'week'">
        <div class="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
          <div v-for="wd in weekDays" :key="wd.date" class="bg-white dark:bg-slate-800 min-h-[200px] p-2">
            <div class="text-center mb-2">
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">{{ wd.dayName }}</span>
              <span
                class="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full mt-0.5"
                :class="wd.isToday ? 'bg-brand-primary text-white' : 'text-slate-700 dark:text-slate-300'"
              >{{ wd.dayNum }}</span>
            </div>
            <div class="space-y-1">
              <div
                v-for="ev in wd.events.slice(0, 4)" :key="ev.uuid || ev.id"
                class="text-[10px] px-1.5 py-1 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                :class="statusDot(ev.status).replace('bg-', 'border-l-2 ') + ' border-l-2'"
                :style="{ borderLeftColor: statusDot(ev.status).replace('bg-', '') }"
                @click="viewCalendarEvent(ev)"
              >
                <div class="font-semibold text-slate-700 dark:text-slate-300 truncate">{{ safeName(ev.patient?.name) }}</div>
                <div class="text-slate-400">{{ formatTimeOnly(ev.start_at) }}</div>
              </div>
              <div v-if="wd.events.length > 4" class="text-[10px] text-brand-primary font-bold px-1 mt-1">+{{ wd.events.length - 4 }} {{ $t('appointments.more') || 'more' }}</div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="space-y-1">
          <div v-if="dayEvents.length === 0" class="h-32 flex items-center justify-center text-sm text-slate-400">{{ $t('appointments.noAppointmentsDay') || 'No appointments on this day' }}</div>
          <div
            v-for="ev in dayEvents" :key="ev.uuid || ev.id"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
            @click="viewCalendarEvent(ev)"
          >
            <div class="w-14 shrink-0 text-center">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 block">{{ formatTimeOnly(ev.start_at) }}</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500">—</span>
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 block">{{ formatTimeOnly(ev.end_at) }}</span>
            </div>
            <div class="w-2 h-2 rounded-full shrink-0" :class="statusDot(ev.status)"></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ safeName(ev.patient?.name) }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ safeName(ev.doctor?.name) }} · {{ safeName(ev.facility?.name) }}</p>
            </div>
            <BaseBadge :variant="statusVariant(ev.status)">{{ statusLabel(ev.status) }}</BaseBadge>
          </div>
        </div>
      </template>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 sm:p-6">
      <div class="flex flex-col lg:flex-row gap-3 mb-4">
        <BaseSearch v-model="searchQuery" :placeholder="$t('appointments.searchPlaceholder') || 'Search patient, doctor or facility...'" @update:model-value="onSearchInput" />
        <select v-model="statusFilter" class="min-w-[150px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition cursor-pointer" @change="currentPage = 1; fetchAppointments()">
          <option value="">{{ $t('appointments.allStatuses') || 'All Statuses' }}</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </select>
        <input v-model="facilityFilter" type="text" :placeholder="$t('appointments.facilityPlaceholder') || 'Facility name...'" class="min-w-[160px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none transition" @input="clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { currentPage = 1; fetchAppointments() }, 400)" />
        <input v-model="doctorFilter" type="text" :placeholder="$t('appointments.doctorPlaceholder') || 'Doctor name...'" class="min-w-[160px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none transition" @input="clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { currentPage = 1; fetchAppointments() }, 400)" />
        <input v-model="dateFrom" type="date" class="min-w-[150px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition" @change="currentPage = 1; fetchAppointments()" />
        <input v-model="dateTo" type="date" class="min-w-[150px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition" @change="currentPage = 1; fetchAppointments()" />
        <button v-if="hasActiveFilters" class="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer" @click="clearFilters">{{ $t('appointments.clear') || 'Clear' }}</button>
      </div>

      <BaseTable v-if="!error" :columns="tableColumns" :items="appointments" :loading="loading">
        <template #cell(uuid)="{ item }">
          <code class="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 px-2 py-0.5 rounded">{{ getAppointmentId(item) }}</code>
        </template>
        <template #cell(patient)="{ item }">
          <span class="text-sm font-bold text-slate-900 dark:text-white">{{ safeName(item.patient?.name) }}</span>
        </template>
        <template #cell(doctor)="{ item }">
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ safeName(item.doctor?.name) }}</span>
        </template>
        <template #cell(facility)="{ item }">
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ safeName(item.facility?.name) }}</span>
        </template>
        <template #cell(date)="{ item }">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ formatDateOnly(item.start_at || item.appointment_date) }}</span>
        </template>
        <template #cell(start_time)="{ item }">
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatTimeOnly(item.start_at) }}</span>
        </template>
        <template #cell(end_time)="{ item }">
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatTimeOnly(item.end_at) }}</span>
        </template>
        <template #cell(status)="{ item }">
          <BaseBadge :variant="statusVariant(item.status)">{{ statusLabel(item.status) }}</BaseBadge>
        </template>
        <template #cell(created_at)="{ item }">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDateOnly(item.created_at) }}</span>
        </template>
        <template #cell(actions)="{ item }">
          <button class="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 rounded-lg transition cursor-pointer" @click="viewDetails(item)">{{ $t('appointments.view') || 'View' }}</button>
        </template>
        <template #empty>
          <BaseEmptyState
            v-if="hasActiveFilters"
            icon="search_off"
            :title="$t('appointments.notFound') || 'No appointments found'"
            :description="$t('appointments.notFoundDesc') || 'Try adjusting your search or filters'"
            @reset="clearFilters"
          />
          <BaseEmptyState
            v-else
            icon="calendar_month"
            :title="$t('appointments.empty') || 'No appointments yet'"
            :description="$t('appointments.emptyDesc') || 'Appointments across the platform will appear here'"
          />
        </template>
      </BaseTable>

      <div v-if="error" class="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 text-center">
        <div class="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ $t('appointments.failedToLoad') || 'Failed to load appointments' }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
        <button class="px-5 py-2.5 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20 cursor-pointer" @click="fetchAppointments">{{ $t('appointments.tryAgain') || 'Try Again' }}</button>
      </div>

      <BasePagination v-if="totalItems > perPage" :current-page="currentPage" :total-pages="lastPage" :total-items="totalItems" :items-per-page="perPage" @change="changePage" />
    </div>

    <BaseDialog :show="showDetailModal" :title="$t('appointments.details') || 'Appointment Details'" size="lg" @close="closeDetail">
      <div v-if="selectedAppointment" class="space-y-5">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg">{{ getNameInitial(selectedAppointment.patient?.name) }}</div>
            <div>
              <h4 class="text-lg font-bold text-slate-900 dark:text-white">{{ safeName(selectedAppointment.patient?.name) }}</h4>
              <BaseBadge :variant="statusVariant(selectedAppointment.status)">{{ statusLabel(selectedAppointment.status) }}</BaseBadge>
            </div>
          </div>
          <code class="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">{{ getAppointmentId(selectedAppointment) }}</code>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('appointments.doctor') || 'Doctor' }}</span>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ safeName(selectedAppointment.doctor?.name) }}</p>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('appointments.facility') || 'Facility' }}</span>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ safeName(selectedAppointment.facility?.name) }}</p>
            </div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('appointments.dateTime') || 'Date & Time' }}</span>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ formatDateOnly(selectedAppointment.start_at) }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatTimeOnly(selectedAppointment.start_at) }} — {{ formatTimeOnly(selectedAppointment.end_at) }}</p>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('appointments.created') || 'Created' }}</span>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ formatDateTime(selectedAppointment.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
