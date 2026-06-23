<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { usePatients } from '@/composables/usePatients'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'

const workspaceStore = useWorkspaceStore()
const { can } = useAuthPermissions()

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

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

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
  return (name || '?').charAt(0).toUpperCase()
}

function formatPhone(phone) {
  if (!phone) return '—'
  return phone
}

function getPatientAge(dob) {
  if (!dob) return '—'
  const birth = new Date(dob)
  const diff = new Date() - birth
  return Math.floor(diff / 31557600000)
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
  <div class="space-y-6">

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Patients</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and track all facility patients</p>
        <div v-if="workspaceStore.currentWorkspace" class="flex items-center gap-2 mt-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
            {{ workspaceStore.currentFacility?.name }}
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {{ workspaceStore.currentRole?.name }}
          </span>
        </div>
      </div>
      <button
        v-if="can('patients.manage')"
        class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Patient
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="p-4 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="lg:col-span-2 relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              :value="filters.search"
              type="text"
              placeholder="Search patient name or phone..."
              class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
              @input="debouncedSearch($event.target.value)"
            />
          </div>
          <select
            :value="filters.status"
            class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer"
            @change="setFilter('status', $event.target.value)"
          >
            <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <select
            v-if="showStaffFilter"
            :value="filters.staff_uuid"
            class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer"
            @change="setFilter('staff_uuid', $event.target.value)"
          >
            <option value="">All Staff</option>
            <option v-for="s in facilityStaff" :key="s.uuid || s.id" :value="s.uuid">{{ s.name }} — {{ s.role }}</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <select
              :value="pagination.per_page"
              class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer"
              @change="setPerPage(Number($event.target.value))"
            >
              <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }} per page</option>
            </select>
          </div>
          <button
            v-if="hasActiveFilters"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-primary rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            @click="resetFilters"
          >
            <span class="material-symbols-outlined text-base">filter_alt_off</span> Clear Filters
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Staff</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Visit</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <template v-if="loading">
              <tr v-for="i in 8" :key="i" class="animate-pulse">
                <td class="px-5 py-4"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"></div><div class="space-y-1.5"><div class="h-3 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div><div class="h-2.5 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div></div></div></td>
                <td class="px-5 py-4"><div class="h-3 w-32 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
                <td class="px-5 py-4"><div class="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
                <td class="px-5 py-4"><div class="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
                <td class="px-5 py-4"><div class="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto"></div></td>
                <td class="px-5 py-4"><div class="h-7 w-7 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
              </tr>
            </template>
            <template v-else-if="patients.length">
              <tr
                v-for="patient in patients"
                :key="patient.id || patient.uuid"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <img v-if="patient.avatar" :src="patient.avatar" alt="" class="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div v-else class="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold shrink-0">{{ getInitial(patient.name) }}</div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ patient.name || '—' }}</p>
                      <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ patient.uuid ? patient.uuid.slice(0, 8) : '' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="min-w-0">
                    <p class="text-sm text-slate-600 dark:text-slate-400 truncate">{{ formatPhone(patient.phone) }}</p>
                    <p v-if="patient.email" class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ patient.email }}</p>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span class="text-sm text-slate-600 dark:text-slate-400 truncate block">{{ patient.assigned_staff || '—' }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatDate(patient.last_visit) }}</span>
                </td>
                <td class="px-5 py-4 text-center">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ring-inset"
                    :class="patient.status === 'active' || patient.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-gray-50 text-gray-700 ring-gray-600/20'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="patient.status === 'active' || patient.is_active ? 'bg-emerald-500' : 'bg-gray-500'"></span>
                    {{ patient.status === 'active' || patient.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <div v-if="can('patients.manage')" class="relative inline-block" data-dropdown @click.stop>
                    <button
                      class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                      @click="toggleDropdown(patient.id || patient.uuid, $event)"
                    >
                      <span class="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                    <Transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                      <div
                        v-if="activeDropdown === (patient.id || patient.uuid)"
                        class="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-40"
                      >
                        <button class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition" @click="activeDropdown = null">
                          <span class="material-symbols-outlined text-base text-slate-400">visibility</span> View Details
                        </button>
                        <button class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition" @click="activeDropdown = null">
                          <span class="material-symbols-outlined text-base text-slate-400">edit</span> Edit
                        </button>
                      </div>
                    </Transition>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="6" class="px-5 py-16 text-center">
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

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Showing <span class="font-bold text-slate-900 dark:text-white">{{ pagination.from || 0 }}</span>
        to <span class="font-bold text-slate-900 dark:text-white">{{ pagination.to || 0 }}</span>
        of <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span> patients
      </p>
      <div class="flex items-center gap-1.5">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page <= 1"
          @click="setPage(pagination.current_page - 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition"
          :class="p === pagination.current_page
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="setPage(p)"
        >{{ p }}</button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="setPage(pagination.current_page + 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>
