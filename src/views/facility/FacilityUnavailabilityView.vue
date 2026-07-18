<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useI18n } from 'vue-i18n'
import { useFormatDate } from '@/composables/useFormatDate'
import { useFacilityUnavailability } from '@/composables/useFacilityUnavailability'
import StatusBadge from '@/components/facility/unavailability/StatusBadge.vue'
import SummaryCards from '@/components/facility/unavailability/SummaryCards.vue'
import RequestDetailsDialog from '@/components/facility/unavailability/RequestDetailsDialog.vue'
import ApproveDialog from '@/components/facility/unavailability/ApproveDialog.vue'
import RejectDialog from '@/components/facility/unavailability/RejectDialog.vue'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'

const workspaceStore = useWorkspaceStore()
const { can } = useAuthPermissions()
const { t } = useI18n()
const { formatDate } = useFormatDate()
const {
  loading, error, saving, requests, pagination, stats,
  fetchRequests, approveRequest, rejectRequest,
} = useFacilityUnavailability()

const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const perPage = ref(15)

const showDetailsModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedRequest = ref(null)

let searchTimeout = null

function debouncedSearch(val) {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchQuery.value = val
    currentPage.value = 1
    fetchList()
  }, 400)
}

function setStatusFilter(val) {
  statusFilter.value = val
  currentPage.value = 1
  fetchList()
}

function setDateFrom(val) {
  dateFrom.value = val
  currentPage.value = 1
  fetchList()
}

function setDateTo(val) {
  dateTo.value = val
  currentPage.value = 1
  fetchList()
}

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
  fetchList()
}

function setPage(page) {
  currentPage.value = page
  fetchList()
}

function fetchList() {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
  }
  if (searchQuery.value) params.search = searchQuery.value
  if (statusFilter.value) params.status = statusFilter.value
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  fetchRequests(params)
}

function openDetailsModal(request) {
  selectedRequest.value = request
  showDetailsModal.value = true
}

function openApproveModal(request) {
  selectedRequest.value = request
  showApproveModal.value = true
}

function openRejectModal(request) {
  selectedRequest.value = request
  showRejectModal.value = true
}

async function handleApprove() {
  if (!selectedRequest.value) return
  const result = await approveRequest(selectedRequest.value.uuid)
  if (result.success) {
    showApproveModal.value = false
    showDetailsModal.value = false
    selectedRequest.value = null
  }
}

async function handleReject(notes) {
  if (!selectedRequest.value) return
  const result = await rejectRequest(selectedRequest.value.uuid, notes)
  if (result.success) {
    showRejectModal.value = false
    showDetailsModal.value = false
    selectedRequest.value = null
  }
}

function getStaffName(staff) {
  if (!staff) return '—'
  const name = staff.user?.name || staff.name
  if (!name) return '—'
  if (typeof name === 'string') return name
  return name.en || name.ar || '—'
}

function getStaffAvatar(staff) {
  return staff?.user?.avatar || staff?.avatar || null
}

function formatPeriod(startDate, endDate) {
  if (!startDate || !endDate) return '—'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const opts = { month: 'short', day: 'numeric', year: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)}\n${end.toLocaleDateString('en-US', opts)}`
}

function formatTimeRange(startTime, endTime) {
  if (!startTime && !endTime) return 'All Day'
  return `${startTime || '00:00'} - ${endTime || '23:59'}`
}

function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return '—'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10
  if (diffHours < 24) return `${diffHours} Hours`
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24) * 10) / 10
  return `${diffDays} Days`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
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

onMounted(() => fetchList())

watch(() => workspaceStore.currentWorkspaceId, () => {
  currentPage.value = 1
  searchQuery.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  fetchList()
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('unavailability.management') || 'Staff Unavailability Requests' }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('unavailability.subtitle') || 'Review and manage unavailable time requests submitted by your staff.' }}</p>
      </div>
      <button class="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="fetchList">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/></svg>
        Refresh
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        <span>{{ error }}</span>
      </div>
      <button class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 underline transition cursor-pointer" @click="fetchList">Retry</button>
    </div>

    <!-- Summary Cards -->
    <SummaryCards :stats="stats" />

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
      <div class="relative w-full sm:w-64">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="text"
          placeholder="Search by staff name..."
          class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          @input="debouncedSearch($event.target.value)"
        />
      </div>
      <select
        :value="statusFilter"
        class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 min-w-[140px]"
        @change="setStatusFilter($event.target.value)"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input
        type="date"
        :value="dateFrom"
        class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        placeholder="From date"
        @input="setDateFrom($event.target.value)"
      />
      <input
        type="date"
        :value="dateTo"
        class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        placeholder="To date"
        @input="setDateTo($event.target.value)"
      />
      <button
        v-if="searchQuery || statusFilter || dateFrom || dateTo"
        class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        @click="resetFilters"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
        Reset
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">Staff</th>
            <th class="px-5 py-3.5">Requested Period</th>
            <th class="px-5 py-3.5">Duration</th>
            <th class="px-5 py-3.5">Reason</th>
            <th class="px-5 py-3.5">Submitted At</th>
            <th class="px-5 py-3.5">Status</th>
            <th class="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <tr v-for="i in 5" :key="i" class="animate-pulse">
            <td class="px-5 py-3.5"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700"></div><div class="space-y-1.5"><div class="h-4 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div><div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></div></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
            <td class="px-5 py-3.5"><div class="h-7 w-20 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">Staff</th>
            <th class="px-5 py-3.5">Requested Period</th>
            <th class="px-5 py-3.5">Duration</th>
            <th class="px-5 py-3.5">Reason</th>
            <th class="px-5 py-3.5">Submitted At</th>
            <th class="px-5 py-3.5">Status</th>
            <th class="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <template v-if="requests.length">
            <tr v-for="req in requests" :key="req.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition" :class="req.status === 'pending' ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <img v-if="getStaffAvatar(req.staff)" :src="getStaffAvatar(req.staff)" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0" />
                  <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0">
                    {{ getStaffName(req.staff).charAt(0) }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ getStaffName(req.staff) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{{ formatPeriod(req.start_date, req.end_date) }}</div>
                <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ formatTimeRange(req.start_time, req.end_time) }}</div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <svg class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ calculateDuration(req.start_date, req.end_date) }}
                </div>
              </td>
              <td class="px-5 py-3.5">
                <p class="text-sm text-slate-600 dark:text-slate-400 max-w-[180px] truncate" :title="req.reason">{{ req.reason || '—' }}</p>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ timeAgo(req.created_at) }}</span>
              </td>
              <td class="px-5 py-3.5">
                <StatusBadge :status="req.status" />
              </td>
              <td class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer" title="View" @click="openDetailsModal(req)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <template v-if="req.status === 'pending'">
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition cursor-pointer" title="Approve" @click="openApproveModal(req)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer" title="Reject" @click="openRejectModal(req)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="7" class="px-5 py-16">
              <div class="flex flex-col items-center justify-center gap-4">
                <BaseEmptyState
                  :icon="searchQuery || statusFilter || dateFrom || dateTo ? 'search_off' : 'inbox'"
                  :title="searchQuery || statusFilter || dateFrom || dateTo ? 'No requests found' : 'No unavailability requests'"
                  :description="searchQuery || statusFilter || dateFrom || dateTo ? 'Try adjusting your search or filters.' : 'When staff submit unavailable time requests they will appear here.'"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!loading && requests.length" class="md:hidden space-y-3">
      <div v-for="req in requests" :key="req.uuid" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm" :class="req.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <img v-if="getStaffAvatar(req.staff)" :src="getStaffAvatar(req.staff)" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0" />
            <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0">
              {{ getStaffName(req.staff).charAt(0) }}
            </div>
            <div>
              <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ getStaffName(req.staff) }}</p>
              <StatusBadge :status="req.status" class="mt-1" />
            </div>
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ timeAgo(req.created_at) }}</span>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
            {{ formatPeriod(req.start_date, req.end_date) }} · {{ formatTimeRange(req.start_time, req.end_time) }}
          </div>
          <div v-if="req.reason" class="text-slate-500 dark:text-slate-400 line-clamp-2">{{ req.reason }}</div>
        </div>
        <div v-if="req.status === 'pending'" class="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <button class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition cursor-pointer" @click="openApproveModal(req)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            Approve
          </button>
          <button class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer" @click="openRejectModal(req)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
            Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1 && !loading" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Showing <span class="font-bold text-slate-900 dark:text-white">{{ pagination.from || 0 }}</span>
        to <span class="font-bold text-slate-900 dark:text-white">{{ pagination.to || 0 }}</span>
        of <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span> results
      </p>
      <div class="flex items-center gap-1.5">
        <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition" :disabled="pagination.current_page <= 1" @click="setPage(pagination.current_page - 1)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <button v-for="pg in visiblePages" :key="pg" class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition" :class="pg === pagination.current_page ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'" @click="setPage(pg)">{{ pg }}</button>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition" :disabled="pagination.current_page >= pagination.last_page" @click="setPage(pagination.current_page + 1)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
    </div>

    <!-- Dialogs -->
    <RequestDetailsDialog
      :show="showDetailsModal"
      :request="selectedRequest"
      @close="showDetailsModal = false; selectedRequest = null"
      @approve="openApproveModal(selectedRequest)"
      @reject="openRejectModal(selectedRequest)"
    />

    <ApproveDialog
      :show="showApproveModal"
      :request="selectedRequest"
      :saving="saving"
      @confirm="handleApprove"
      @close="showApproveModal = false"
    />

    <RejectDialog
      :show="showRejectModal"
      :request="selectedRequest"
      :saving="saving"
      @confirm="handleReject"
      @close="showRejectModal = false"
    />
  </div>
</template>
