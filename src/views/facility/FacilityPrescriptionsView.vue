<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { getFacilityPrescriptions, getFacilityOwnerPrescriptionAnalytics } from '@/services/prescriptionService'
import AddPrescriptionDialog from '@/components/prescriptions/AddPrescriptionDialog.vue'
import PrescriptionDetailDialog from '@/components/dashboard/Prescriptions/PrescriptionDetailDialog.vue'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue'

const staffStore = useStaffStore()
const workspaceStore = useWorkspaceStore()
const { can } = useAuthPermissions()

const prescriptions = ref([])
const loading = ref(false)
const error = ref(null)

const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 })

const analytics = ref({ total: 0, active: 0, pharmacy_selected: 0, accepted: 0, dispensed: 0, rejected: 0, cancelled: 0 })
const analyticsLoading = ref(false)

const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const selectedPrescription = ref(null)

const canCreatePrescription = computed(() => can('create_prescription'))

const statusTabs = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pharmacy_selected', label: 'Pharmacy Selected' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'dispensed', label: 'Dispensed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
]

const statusColors = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  pharmacy_selected: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  accepted: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  dispensed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  cancelled: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
}

let searchDebounce = null

function debouncedSearch(val) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    search.value = val
    currentPage.value = 1
    fetchPrescriptions()
  }, 350)
}

function setStatusFilter(key) {
  statusFilter.value = key
  currentPage.value = 1
  fetchPrescriptions()
}

function viewPrescription(p) {
  selectedPrescription.value = p
  showDetailDialog.value = true
}

function closeDetail() {
  showDetailDialog.value = false
  selectedPrescription.value = null
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

function setPage(page) {
  currentPage.value = page
  fetchPrescriptions()
}

const visiblePages = computed(() => {
  const total = pagination.value.last_page
  const cur = pagination.value.current_page
  const pages = []
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

async function fetchPrescriptions() {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
    }
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value

    const { data } = await getFacilityPrescriptions(params)

    prescriptions.value = data.data || []
    if (data.meta) {
      pagination.value = {
        current_page: data.meta.current_page || 1,
        last_page: data.meta.last_page || 1,
        per_page: data.meta.per_page || 10,
        total: data.meta.total || 0,
        from: data.meta.from || 0,
        to: data.meta.to || 0,
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load prescriptions'
    prescriptions.value = []
  } finally {
    loading.value = false
  }
}

async function fetchAnalytics() {
  if (!can('view_prescriptions')) return
  analyticsLoading.value = true
  try {
    const res = await getFacilityOwnerPrescriptionAnalytics()
    const d = res.data?.data ?? res.data
    analytics.value = {
      total: d.total ?? d.total_prescriptions ?? 0,
      active: d.active ?? d.active_prescriptions ?? 0,
      pharmacy_selected: d.pharmacy_selected ?? 0,
      accepted: d.accepted ?? 0,
      dispensed: d.dispensed ?? d.dispensed_prescriptions ?? 0,
      rejected: d.rejected ?? 0,
      cancelled: d.cancelled ?? d.cancelled_prescriptions ?? 0,
    }
  } catch {
    analytics.value = { total: 0, active: 0, pharmacy_selected: 0, accepted: 0, dispensed: 0, rejected: 0, cancelled: 0 }
  } finally {
    analyticsLoading.value = false
  }
}

onMounted(() => {
  fetchPrescriptions()
  fetchAnalytics()
})

watch(() => workspaceStore.currentWorkspaceId, () => {
  currentPage.value = 1
  search.value = ''
  statusFilter.value = ''
  fetchPrescriptions()
  fetchAnalytics()
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Prescriptions</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ pagination.total }} prescription(s)</p>
      </div>
      <button v-if="canCreatePrescription && can('create_prescription')" class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer" @click="showAddDialog = true">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New Prescription
      </button>
    </div>

    <template v-if="can('view_prescriptions')">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <template v-if="analyticsLoading">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0"></div>
              <div class="space-y-2 flex-1">
                <div class="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
                <div class="h-7 w-10 bg-slate-100 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <StatisticsCard title="Total" :value="analytics.total" icon="description" color="primary" />
          <StatisticsCard title="Active" :value="analytics.active" icon="play_circle" color="success" />
          <StatisticsCard title="Pharmacy Selected" :value="analytics.pharmacy_selected" icon="local_pharmacy" color="info" />
          <StatisticsCard title="Dispensed" :value="analytics.dispensed" icon="medication" color="info" />
        </template>
      </div>
    </template>

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
        <input type="text" placeholder="Search prescriptions..." class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40" @input="debouncedSearch($event.target.value)" />
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          class="rounded-lg px-3.5 py-2 text-xs font-bold transition cursor-pointer"
          :class="statusFilter === tab.key
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'"
          @click="setStatusFilter(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">UUID</th>
            <th class="px-5 py-3.5">Patient</th>
            <th class="px-5 py-3.5">Doctor</th>
            <th class="px-5 py-3.5">Status</th>
            <th class="px-5 py-3.5">Items</th>
            <th class="px-5 py-3.5">Created At</th>
            <th v-if="canCreatePrescription" class="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <template v-if="loading">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-5 py-3.5"><div class="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3.5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700"></div><div class="h-4 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div></div></td>
              <td class="px-5 py-3.5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700"></div><div class="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></div></td>
              <td class="px-5 py-3.5"><div class="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
              <td class="px-5 py-3.5"><div class="h-4 w-8 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3.5"><div class="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td v-if="canCreatePrescription" class="px-5 py-3.5"><div class="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
            </tr>
          </template>
          <template v-else-if="error">
            <tr>
              <td :colspan="canCreatePrescription ? 7 : 6" class="px-5 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <span class="material-symbols-outlined text-3xl text-red-400">error_outline</span>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ error }}</p>
                  <button class="rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-dark transition" @click="fetchPrescriptions">Try Again</button>
                </div>
              </td>
            </tr>
          </template>
          <template v-else-if="prescriptions.length">
            <tr v-for="p in prescriptions" :key="p.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">{{ shortUuid(p.uuid) }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div v-if="p.appointment?.patient?.avatar" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-brand-primary/15 overflow-hidden shrink-0">
                    <img :src="p.appointment.patient.avatar" :alt="p.appointment?.patient?.name || ''" class="w-full h-full object-cover" />
                  </div>
                  <AvatarInitial v-else :name="p.appointment?.patient?.name || 'A'" />
                  <span class="font-semibold text-slate-900 dark:text-white">{{ p.appointment?.patient?.name || '—' }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div v-if="p.appointment?.doctor?.avatar" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-brand-primary/15 overflow-hidden shrink-0">
                    <img :src="p.appointment.doctor.avatar" :alt="p.appointment?.doctor?.name || ''" class="w-full h-full object-cover" />
                  </div>
                  <AvatarInitial v-else :name="p.appointment?.doctor?.name || 'D'" />
                  <span class="font-medium text-slate-600 dark:text-slate-400">{{ p.appointment?.doctor?.name || '—' }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span class="rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize" :class="statusColors[p.status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'">{{ p.status?.replace('_', ' ') || '—' }}</span>
              </td>
              <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400">{{ p.items?.length ?? 0 }}</td>
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{{ formatDate(p.created_at) }}</td>
              <td v-if="canCreatePrescription" class="px-5 py-3.5 text-right">
                <button class="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer" @click="viewPrescription(p)">View</button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="canCreatePrescription ? 7 : 6" class="px-5 py-12 text-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">prescriptions</span>
              <p class="mt-2 text-sm font-bold text-slate-900 dark:text-white">No prescriptions found</p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Try changing filters or creating a new prescription.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.last_page > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Showing <span class="font-bold text-slate-900 dark:text-white">{{ pagination.from || 0 }}</span>
        to <span class="font-bold text-slate-900 dark:text-white">{{ pagination.to || 0 }}</span>
        of <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span>
      </p>
      <div class="flex items-center gap-1.5">
        <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition" :disabled="pagination.current_page <= 1" @click="setPage(pagination.current_page - 1)">
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button v-for="pg in visiblePages" :key="pg" class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition"
          :class="pg === pagination.current_page ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="setPage(pg)">{{ pg }}</button>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition" :disabled="pagination.current_page >= pagination.last_page" @click="setPage(pagination.current_page + 1)">
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
    <AddPrescriptionDialog :show="showAddDialog" @close="showAddDialog = false" @created="fetchPrescriptions" />
    <Teleport to="body">
      <PrescriptionDetailDialog :show="showDetailDialog" :prescription="selectedPrescription" @close="closeDetail" />
    </Teleport>
  </div>
</template>
