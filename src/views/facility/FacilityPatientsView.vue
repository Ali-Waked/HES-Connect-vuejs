<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { usePatients } from '@/composables/usePatients'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'

const workspaceStore = useWorkspaceStore()
const { can } = useAuthPermissions()
const { locale } = useI18n()

const {
  patients, loading, error, pagination, filters,
  facilityStaff, showStaffFilter, hasActiveFilters,
  fetchPatients, fetchFacilityStaff, setPage, setPerPage, setFilter, resetFilters,
} = usePatients()

const activeDropdown = ref(null)

function toggleDropdown(id, e) {
  e.stopPropagation()
  activeDropdown.value = activeDropdown.value === id ? null : id
}

function closeDropdowns(e) {
  if (!e.target.closest('[data-dropdown]')) activeDropdown.value = null
}

onMounted(async () => {
  document.addEventListener('click', closeDropdowns)
  await Promise.all([fetchPatients(), fetchFacilityStaff()])
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdowns)
})

watch(() => workspaceStore.currentWorkspaceId, async () => {
  await Promise.all([fetchPatients(), fetchFacilityStaff()])
})

const perPageOptions = [10, 25, 50, 100]

let searchDebounce = null
function debouncedSearch(val) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => setFilter('search', val), 350)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitial(name) {
  if (!name || name === '—') return '?'
  return String(name).charAt(0).toUpperCase()
}

function getPatientName(patient) {
  return resolveTranslatedValue(patient.user?.name || patient.name, locale.value) || '—'
}

function getPatientEmail(patient) {
  return patient.user?.email || patient.email || '—'
}

function getAssignedStaff(patient) {
  if (!patient.appointments?.length) return '—'
  const latest = patient.appointments[0]
  return resolveTranslatedValue(latest.facility_staff?.staff?.user?.name, locale.value) || '—'
}

function getStaffCount(patient) {
  if (!patient.appointments?.length) return 0
  const staffIds = new Set()
  patient.appointments.forEach(a => {
    if (a.facility_staff?.staff?.user?.id) staffIds.add(a.facility_staff.staff.user.id)
  })
  return staffIds.size
}

function getAppointmentCount(patient) {
  return patient.appointments?.length || 0
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr.replace(' ', 'T'))
  if (isNaN(d.getTime())) return '—'
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
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
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Patients</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track all facility patients</p>
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

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            :value="filters.search"
            type="text"
            placeholder="Search patient name or email..."
            class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
            @input="debouncedSearch($event.target.value)"
          />
        </div>
        <select
          v-if="showStaffFilter"
          :value="filters.staff_uuid"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer min-w-[180px]"
          @change="setFilter('staff_uuid', $event.target.value)"
        >
          <option value="">All Staff</option>
          <option v-for="s in facilityStaff" :key="s.uuid || s.id" :value="s.uuid">{{ s.name }} — {{ s.role }}</option>
        </select>
        <select
          :value="pagination.per_page"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer min-w-[120px]"
          @change="setPerPage(Number($event.target.value))"
        >
          <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }} / page</option>
        </select>
        <button
          v-if="hasActiveFilters"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-primary rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-600"
          @click="resetFilters"
        >
          <span class="material-symbols-outlined text-base">filter_alt_off</span> Clear
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900/30 p-8 text-center">
      <div class="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span class="material-symbols-outlined text-2xl text-rose-400">error_outline</span>
      </div>
      <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to load patients</p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
      <button class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer" @click="fetchPatients()">
        <span class="material-symbols-outlined text-base">refresh</span>
        Try Again
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-else-if="loading" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="p-5 space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded"></div>
            <div class="h-3 w-48 bg-slate-100 dark:bg-slate-700 rounded"></div>
          </div>
          <div class="h-6 w-20 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Staff</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appointments</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Appointment</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <template v-if="patients.length">
              <tr
                v-for="patient in patients"
                :key="patient.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold shrink-0">
                      {{ getInitial(getPatientName(patient)) }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ getPatientName(patient) }}</p>
                      <p class="text-[11px] text-slate-400 dark:text-slate-500 font-mono">ID: {{ patient.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="min-w-0">
                    <p class="text-sm text-slate-600 dark:text-slate-400 truncate">{{ getPatientEmail(patient) }}</p>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div v-if="getStaffCount(patient) > 0" class="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <span class="material-symbols-outlined text-emerald-500 text-sm">person</span>
                    </div>
                    <div v-else class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <span class="material-symbols-outlined text-slate-400 text-sm">person_off</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm text-slate-700 dark:text-slate-300 truncate">{{ getAssignedStaff(patient) }}</p>
                      <p v-if="getStaffCount(patient) > 1" class="text-[10px] text-slate-400 dark:text-slate-500">{{ getStaffCount(patient) }} staff members</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {{ getAppointmentCount(patient) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span class="material-symbols-outlined text-[14px]">event</span>
                    <span class="text-xs">{{ timeAgo(patient.appointments_max_start_at) }}</span>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="5" class="px-5 py-16">
                <BaseEmptyState
                  v-if="hasActiveFilters"
                  icon="search_off"
                  title="No patients found"
                  description="Try changing your filters or search terms."
                  @reset="resetFilters"
                />
                <BaseEmptyState
                  v-else
                  icon="group"
                  title="No patients yet"
                  description="Patients will appear here once registered."
                />
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
        of <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span> patients
      </p>
      <div class="flex items-center gap-1.5">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          :disabled="pagination.current_page <= 1"
          @click="setPage(pagination.current_page - 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition cursor-pointer"
          :class="p === pagination.current_page
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="setPage(p)"
        >{{ p }}</button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="setPage(pagination.current_page + 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
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
