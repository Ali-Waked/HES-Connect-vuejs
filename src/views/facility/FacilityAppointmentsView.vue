<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAppointmentStats } from '@/composables/useAppointmentStats'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import { getAppointments, getAppointment, cancelAppointment, restoreAppointment, forceCompleteAppointment, getFacilityStaff } from '@/services/appointmentService'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue'
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue'

const workspaceStore = useWorkspaceStore()
const { can, isFacilityManager, currentRoleSlug } = useAuthPermissions()
const { locale } = useI18n()

const { stats, loading: statsLoading, fetchStats, startPolling, stopPolling } = useAppointmentStats()

const appointments = ref([])
const loading = ref(false)
const error = ref(null)
const selectedAppointment = ref(null)
const facilityStaff = ref([])
const activeDropdown = ref(null)
const drawerOpen = ref(false)
const cancelModalOpen = ref(false)
const cancelReason = ref('')

const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 })

const filters = ref({ search: '', status: '', date_from: '', date_to: '', staff_uuid: '' })

let searchDebounce = null

const showStaffFilter = computed(() => {
  return can('appointments.view-all') || isFacilityManager() || currentRoleSlug.value === 'facility_owner'
})

const hasActiveFilters = computed(() => {
  return Object.entries(filters.value).some(([, v]) => v)
})

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
  { value: 'rescheduled', label: 'Rescheduled' },
]

const perPageOptions = [10, 25, 50, 100]

const statusStyles = {
  scheduled: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  confirmed: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400',
  checked_in: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  in_progress: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  no_show: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400',
  rescheduled: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
}

const statusDotColors = {
  scheduled: 'bg-blue-500', confirmed: 'bg-teal-500', checked_in: 'bg-amber-500',
  in_progress: 'bg-orange-500', completed: 'bg-emerald-500', cancelled: 'bg-red-500',
  no_show: 'bg-gray-500', rescheduled: 'bg-indigo-500',
}

const roleBadgeColors = {
  doctor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  nurse: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  pharmacist: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  facility_owner: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  facility_manager: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  receptionist: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
}

function formatStatus(s) { return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }
function formatTime(d) { return d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—' }

function resolveName(field) {
  if (!field) return '—'
  return resolveTranslatedValue(field, locale.value) || '—'
}

function getInitial(name) {
  if (!name || name === '—') return '?'
  return String(name).charAt(0).toUpperCase()
}

function canCancel(s) { return s === 'scheduled' || s === 'confirmed' }
function canRestore(s) { return s === 'cancelled' }
function canComplete(s) { return s === 'in_progress' || s === 'checked_in' }
function hasActions(item) { return canCancel(item.status) || canRestore(item.status) || canComplete(item.status) }

function debouncedSearch(val) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => setFilter('search', val), 350)
}

function setFilter(key, value) {
  filters.value[key] = value
  pagination.value.current_page = 1
  fetchAppointments()
}

function setPerPage(value) {
  pagination.value.per_page = value
  pagination.value.current_page = 1
  fetchAppointments()
}

function setPage(page) {
  pagination.value.current_page = page
  fetchAppointments()
}

function resetFilters() {
  filters.value = { search: '', status: '', date_from: '', date_to: '', staff_uuid: '' }
  pagination.value.current_page = 1
  fetchAppointments()
}

function toggleDropdown(id, e) {
  e.stopPropagation()
  activeDropdown.value = activeDropdown.value === id ? null : id
}

function closeDropdowns(e) {
  if (!e.target.closest('[data-dropdown]')) activeDropdown.value = null
}

async function fetchAppointments() {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      date_from: filters.value.date_from || undefined,
      date_to: filters.value.date_to || undefined,
      staff_uuid: (showStaffFilter.value && filters.value.staff_uuid) ? filters.value.staff_uuid : undefined,
    }
    const { data } = await getAppointments(params)
    const payload = data.data || data || []
    appointments.value = Array.isArray(payload) ? payload : []
    const page = data.meta || data
    pagination.value = {
      current_page: page.current_page || 1,
      last_page: page.last_page || 1,
      per_page: page.per_page || 10,
      total: page.total || 0,
      from: page.from || 0,
      to: page.to || 0,
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load appointments'
  } finally {
    loading.value = false
  }
}

async function fetchStaff() {
  if (!showStaffFilter.value) return
  try {
    const { data } = await getFacilityStaff()
    facilityStaff.value = data.data || data || []
  } catch { facilityStaff.value = [] }
}

async function openDrawer(item) {
  drawerOpen.value = true
  activeDropdown.value = null
  try {
    const { data } = await getAppointment(item.uuid || item.id)
    selectedAppointment.value = data.data || data
  } catch { selectedAppointment.value = item }
}

function closeDrawer() { drawerOpen.value = false; selectedAppointment.value = null }

async function handleCancel(uuid) {
  if (uuid) {
    const item = appointments.value.find(a => (a.uuid || a.id) === uuid)
    if (item) selectedAppointment.value = item
  }
  cancelModalOpen.value = true
  activeDropdown.value = null
}

async function confirmCancel() {
  if (!selectedAppointment.value) return
  try {
    await cancelAppointment(selectedAppointment.value.uuid || selectedAppointment.value.id, { reason: cancelReason.value })
    cancelModalOpen.value = false
    cancelReason.value = ''
    await Promise.all([fetchAppointments(), fetchStats()])
  } catch {}
}

async function handleForceComplete(uuid) {
  try { await forceCompleteAppointment(uuid); await Promise.all([fetchAppointments(), fetchStats()]) } catch {}
  activeDropdown.value = null
}

async function handleRestore(uuid) {
  try { await restoreAppointment(uuid); await Promise.all([fetchAppointments(), fetchStats()]) } catch {}
  activeDropdown.value = null
}

const visiblePages = computed(() => {
  const total = pagination.value.last_page
  const current = pagination.value.current_page
  const pages = []
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) { if (start === 1) end = Math.min(total, start + 4); else start = Math.max(1, end - 4) }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(async () => {
  document.addEventListener('click', closeDropdowns)
  await Promise.all([fetchAppointments(), fetchStats(), fetchStaff()])
  startPolling(60000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdowns)
  stopPolling()
})

watch(() => workspaceStore.currentWorkspaceId, async () => {
  await Promise.all([fetchAppointments(), fetchStats(), fetchStaff()])
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Appointments</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track all patient appointments</p>
        <div v-if="workspaceStore.currentFacility" class="flex items-center gap-2 mt-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
            {{ workspaceStore.currentFacility?.name }}
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {{ workspaceStore.currentRole?.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <template v-if="statsLoading">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0"></div>
            <div class="space-y-2 flex-1">
              <div class="h-2 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
              <div class="h-7 w-10 bg-slate-100 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <StatisticsCard title="Total" :value="stats.total" icon="calendar_month" color="info" />
        <StatisticsCard title="Today" :value="stats.today" icon="wb_sunny" color="warning" />
        <StatisticsCard title="Upcoming" :value="stats.upcoming" icon="schedule" color="primary" />
        <StatisticsCard title="Completed" :value="stats.completed" icon="check_circle" color="success" />
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input :value="filters.search" type="text" placeholder="Search patient or staff name..."
            class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
            @input="debouncedSearch($event.target.value)" />
        </div>
        <select :value="filters.status"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer min-w-[140px]"
          @change="setFilter('status', $event.target.value)">
          <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select v-if="showStaffFilter" :value="filters.staff_uuid"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer min-w-[180px]"
          @change="setFilter('staff_uuid', $event.target.value)">
          <option value="">All Staff</option>
          <option v-for="s in facilityStaff" :key="s.uuid || s.id" :value="s.uuid">{{ s.name }} — {{ s.role }}</option>
        </select>
        <input :value="filters.date_from" type="date"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition min-w-[140px]"
          @change="setFilter('date_from', $event.target.value)" />
        <input :value="filters.date_to" type="date"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition min-w-[140px]"
          @change="setFilter('date_to', $event.target.value)" />
        <select :value="pagination.per_page"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer min-w-[110px]"
          @change="setPerPage(Number($event.target.value))">
          <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }} / page</option>
        </select>
        <button v-if="hasActiveFilters"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-primary rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-600"
          @click="resetFilters">
          <span class="material-symbols-outlined text-base">filter_alt_off</span> Clear
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900/30 p-8 text-center">
      <div class="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span class="material-symbols-outlined text-2xl text-rose-400">error_outline</span>
      </div>
      <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to load appointments</p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
      <button class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer" @click="fetchAppointments()">
        <span class="material-symbols-outlined text-base">refresh</span> Try Again
      </button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Staff</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <!-- Loading -->
            <template v-if="loading">
              <tr v-for="i in 6" :key="i" class="animate-pulse">
                <td class="px-5 py-4"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"></div><div class="space-y-1.5"><div class="h-3 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div><div class="h-2.5 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div></div></div></td>
                <td class="px-5 py-4"><div class="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
                <td class="px-5 py-4"><div class="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
                <td class="px-5 py-4"><div class="h-5 w-20 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
                <td class="px-5 py-4"><div class="h-7 w-7 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
              </tr>
            </template>
            <!-- Rows -->
            <template v-else-if="appointments.length">
              <tr v-for="item in appointments" :key="item.id || item.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer" @click="openDrawer(item)">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold shrink-0">
                      {{ getInitial(resolveName(item.patient?.name)) }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ resolveName(item.patient?.name) }}</p>
                      <p class="text-[11px] text-slate-400 dark:text-slate-500">{{ formatDate(item.scheduled_at) }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
                      <span class="text-xs font-bold text-teal-600 dark:text-teal-400">{{ getInitial(resolveName(item.staff?.user?.name || item.staff?.name)) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{{ resolveName(item.staff?.user?.name || item.staff?.name) }}</p>
                      <span v-if="item.staff?.role" class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" :class="roleBadgeColors[item.staff.role] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'">{{ item.staff.role }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <p class="text-sm text-slate-700 dark:text-slate-300">{{ formatDate(item.scheduled_at) }}</p>
                  <p class="text-[11px] text-slate-400 dark:text-slate-500">{{ formatTime(item.scheduled_at) }}</p>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" :class="statusStyles[item.status] || 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDotColors[item.status] || 'bg-gray-500'"></span>
                    {{ formatStatus(item.status) }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <div v-if="hasActions(item)" class="relative inline-block" data-dropdown @click.stop>
                    <button class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer" @click="toggleDropdown(item.id || item.uuid, $event)">
                      <span class="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                    <Transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                      <div v-if="activeDropdown === (item.id || item.uuid)" class="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-40">
                        <button class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition" @click="openDrawer(item)">
                          <span class="material-symbols-outlined text-base text-slate-400">visibility</span> View Details
                        </button>
                        <button v-if="canComplete(item.status)" class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition" @click="handleForceComplete(item.uuid || item.id)">
                          <span class="material-symbols-outlined text-base">check_circle</span> Mark Complete
                        </button>
                        <button v-if="canCancel(item.status)" class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition" @click="handleCancel(item.uuid || item.id)">
                          <span class="material-symbols-outlined text-base">cancel</span> Cancel
                        </button>
                        <button v-if="canRestore(item.status)" class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" @click="handleRestore(item.uuid || item.id)">
                          <span class="material-symbols-outlined text-base">restore</span> Restore
                        </button>
                      </div>
                    </Transition>
                  </div>
                  <button v-else class="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition cursor-pointer" @click="openDrawer(item)">
                    <span class="material-symbols-outlined text-lg">visibility</span>
                  </button>
                </td>
              </tr>
            </template>
            <!-- Empty -->
            <tr v-else>
              <td colspan="5" class="px-5 py-16">
                <BaseEmptyState v-if="hasActiveFilters" icon="search_off" title="No appointments found" description="Try changing your filters or search terms." @reset="resetFilters" />
                <BaseEmptyState v-else icon="calendar_month" title="No appointments yet" description="Appointments will appear here once scheduled." />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > 0 && !loading" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Showing <span class="font-bold text-slate-900 dark:text-white">{{ pagination.from || 0 }}</span>
        to <span class="font-bold text-slate-900 dark:text-white">{{ pagination.to || 0 }}</span>
        of <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span> appointments
      </p>
      <div class="flex items-center gap-1.5">
        <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer" :disabled="pagination.current_page <= 1" @click="setPage(pagination.current_page - 1)">
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button v-for="p in visiblePages" :key="p" class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition cursor-pointer" :class="p === pagination.current_page ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'" @click="setPage(p)">{{ p }}</button>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer" :disabled="pagination.current_page >= pagination.last_page" @click="setPage(pagination.current_page + 1)">
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Detail Drawer -->
    <Teleport to="body">
      <div v-if="drawerOpen && selectedAppointment" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" @click="closeDrawer"></div>
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto animate-slide-in-right">
          <div class="sticky top-0 bg-white dark:bg-slate-900 z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer" @click="closeDrawer">
                  <span class="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div>
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white">Appointment Details</h3>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1" :class="statusStyles[selectedAppointment.status] || 'bg-gray-50 text-gray-700'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDotColors[selectedAppointment.status] || 'bg-gray-500'"></span>
                    {{ formatStatus(selectedAppointment.status) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <button v-if="canComplete(selectedAppointment.status)" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition cursor-pointer" @click="handleForceComplete(selectedAppointment.uuid || selectedAppointment.id)">
                <span class="material-symbols-outlined text-sm">check_circle</span> Complete
              </button>
              <button v-if="canCancel(selectedAppointment.status)" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer" @click="cancelModalOpen = true">
                <span class="material-symbols-outlined text-sm">cancel</span> Cancel
              </button>
              <button v-if="canRestore(selectedAppointment.status)" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition cursor-pointer" @click="handleRestore(selectedAppointment.uuid || selectedAppointment.id)">
                <span class="material-symbols-outlined text-sm">restore</span> Restore
              </button>
            </div>
          </div>
          <div class="p-6 space-y-5">
            <!-- Patient -->
            <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div class="w-12 h-12 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-lg shrink-0">
                {{ getInitial(resolveName(selectedAppointment.patient?.name)) }}
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Patient</p>
                <p class="text-base font-bold text-slate-900 dark:text-white truncate">{{ resolveName(selectedAppointment.patient?.name) }}</p>
              </div>
            </div>
            <!-- Staff -->
            <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div class="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg shrink-0">
                {{ getInitial(resolveName(selectedAppointment.staff?.user?.name || selectedAppointment.staff?.name)) }}
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Staff</p>
                <p class="text-base font-bold text-slate-900 dark:text-white truncate">{{ resolveName(selectedAppointment.staff?.user?.name || selectedAppointment.staff?.name) }}</p>
                <span v-if="selectedAppointment.staff?.role" class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="roleBadgeColors[selectedAppointment.staff.role] || 'bg-slate-100 text-slate-600'">{{ selectedAppointment.staff.role }}</span>
              </div>
            </div>
            <!-- Facility -->
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Facility</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(selectedAppointment.facility?.name) }}</p>
            </div>
            <!-- Date & Rx -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Date</p>
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatDate(selectedAppointment.scheduled_at) }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ formatTime(selectedAppointment.scheduled_at) }}</p>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Prescriptions</p>
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedAppointment.prescriptions_count ?? 0 }}</p>
              </div>
            </div>
            <!-- Created -->
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Created</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(selectedAppointment.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Cancel Modal -->
    <BaseDialog :show="cancelModalOpen" title="Cancel Appointment" size="sm" @close="cancelModalOpen = false; cancelReason = ''">
      <div class="space-y-4">
        <p class="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to cancel this appointment?</p>
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason (optional)</label>
          <textarea v-model="cancelReason" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 min-h-[80px] resize-none" placeholder="Enter cancellation reason..."></textarea>
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer" @click="cancelModalOpen = false; cancelReason = ''">Keep</button>
        <button class="px-4 py-2.5 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition cursor-pointer" @click="confirmCancel">Cancel Appointment</button>
      </template>
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
.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out;
}
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
