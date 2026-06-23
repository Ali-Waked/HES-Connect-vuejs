<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import {
  getFacilityMedicationRequests,
  acceptMedicationRequest,
  rejectMedicationRequest,
} from '@/services/medicationRequestService'
import { resolveTranslatedValue } from '@/utils/locale'
import { useI18n } from 'vue-i18n'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'

const staffStore = useStaffStore()
const workspaceStore = useWorkspaceStore()
const { can } = useAuthPermissions()
const { locale } = useI18n()

const requests = ref([])
const loading = ref(false)
const error = ref(null)
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const search = ref('')

const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 })

const accepting = ref(new Set())
const rejecting = ref(false)
const rejectTarget = ref(null)
const rejectNotes = ref('')
const rejectSubmitting = ref(false)

const statusTabs = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const statusColors = {
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

let searchDebounce = null

function debouncedSearch(val) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    search.value = val
    currentPage.value = 1
    fetchRequests()
  }, 350)
}

function setStatusFilter(key) {
  statusFilter.value = key
  currentPage.value = 1
  fetchRequests()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

function setPage(page) {
  currentPage.value = page
  fetchRequests()
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

async function fetchRequests() {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
    }
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value

    const { data } = await getFacilityMedicationRequests(params)

    requests.value = data.data || []
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
    error.value = err.response?.data?.message || 'Failed to load medication requests'
    requests.value = []
  } finally {
    loading.value = false
  }
}

async function handleAccept(req) {
  if (accepting.value.has(req.uuid)) return
  accepting.value.add(req.uuid)
  try {
    await acceptMedicationRequest(req.uuid)
    req.status = 'approved'
    staffStore.showToast('Medication request approved', 'success')
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to accept request'
    staffStore.showToast(msg, 'error')
  } finally {
    accepting.value.delete(req.uuid)
  }
}

function openRejectModal(req) {
  rejectTarget.value = req
  rejectNotes.value = ''
  rejecting.value = true
}

async function submitReject() {
  if (!rejectTarget.value || rejectSubmitting.value) return
  rejectSubmitting.value = true
  try {
    await rejectMedicationRequest(rejectTarget.value.uuid, { notes: rejectNotes.value })
    rejectTarget.value.status = 'rejected'
    staffStore.showToast('Medication request rejected', 'success')
    rejecting.value = false
    rejectTarget.value = null
    rejectNotes.value = ''
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to reject request'
    staffStore.showToast(msg, 'error')
  } finally {
    rejectSubmitting.value = false
  }
}

let pollTimer = null

function startPolling() {
  stopPolling()
  pollTimer = setInterval(() => {
    fetchRequests()
  }, 30000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  fetchRequests()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

watch(() => workspaceStore.currentWorkspaceId, () => {
  currentPage.value = 1
  search.value = ''
  statusFilter.value = ''
  fetchRequests()
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Medication Requests</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ pagination.total }} request(s)</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition"
        @click="fetchRequests"
      >
        <span class="material-symbols-outlined text-[18px]">refresh</span>
        Refresh
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
        <input
          type="text"
          placeholder="Search by patient name or prescription..."
          class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          @input="debouncedSearch($event.target.value)"
        />
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
            <th class="px-5 py-3.5">Patient</th>
            <th class="px-5 py-3.5">Prescription</th>
            <th class="px-5 py-3.5">Pharmacy</th>
            <th class="px-5 py-3.5">Status</th>
            <th class="px-5 py-3.5">Notes</th>
            <th class="px-5 py-3.5">Created</th>
            <th class="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <template v-if="loading">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-5 py-3.5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700"></div><div class="h-4 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div></div></td>
              <td class="px-5 py-3.5"><div class="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3.5"><div class="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3.5"><div class="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
              <td class="px-5 py-3.5"><div class="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3.5"><div class="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3.5"><div class="h-7 w-24 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
            </tr>
          </template>
          <template v-else-if="error">
            <tr>
              <td colspan="7" class="px-5 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <span class="material-symbols-outlined text-3xl text-red-400">error_outline</span>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ error }}</p>
                  <button class="rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-dark transition" @click="fetchRequests">Try Again</button>
                </div>
              </td>
            </tr>
          </template>
          <template v-else-if="requests.length">
            <tr v-for="r in requests" :key="r.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div v-if="r.patient?.avatar" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-brand-primary/15 overflow-hidden shrink-0">
                    <img :src="r.patient.avatar" :alt="r.patient?.name || ''" class="w-full h-full object-cover" />
                  </div>
                  <AvatarInitial v-else :name="r.patient?.name || 'P'" />
                  <span class="font-semibold text-slate-900 dark:text-white">{{ r.patient?.name || '—' }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span class="font-mono text-xs text-slate-500 dark:text-slate-400">{{ shortUuid(r.prescription?.uuid) }}</span>
              </td>
              <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400">{{ resolveTranslatedValue(r.pharmacy?.name, locale) || '—' }}</td>
              <td class="px-5 py-3.5">
                <span
                  class="rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize"
                  :class="statusColors[r.status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'"
                >{{ r.status || '—' }}</span>
              </td>
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs max-w-[200px] truncate">{{ r.notes || '—' }}</td>
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{{ formatDate(r.created_at) }}</td>
              <td class="px-5 py-3.5 text-right">
                <div v-if="r.status === 'pending'" class="flex items-center justify-end gap-1.5">
                  <button
                    class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition"
                    :class="accepting.has(r.uuid)
                      ? 'bg-green-200 dark:bg-green-900/40 text-green-600 dark:text-green-300 cursor-not-allowed'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer'"
                    :disabled="accepting.has(r.uuid)"
                    @click="handleAccept(r)"
                  >
                    <span v-if="accepting.has(r.uuid)" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span v-else class="material-symbols-outlined text-[16px]">check</span>
                    {{ accepting.has(r.uuid) ? 'Accepting...' : 'Accept' }}
                  </button>
                  <button
                    class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition cursor-pointer"
                    @click="openRejectModal(r)"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                    Reject
                  </button>
                </div>
                <span v-else class="text-xs text-slate-400 dark:text-slate-500 italic">—</span>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="7" class="px-5 py-12 text-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">medication</span>
              <p class="mt-2 text-sm font-bold text-slate-900 dark:text-white">No medication requests found</p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Try changing filters or wait for new patient requests.</p>
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
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page <= 1"
          @click="setPage(pagination.current_page - 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button
          v-for="pg in visiblePages"
          :key="pg"
          class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition"
          :class="pg === pagination.current_page
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="setPage(pg)"
        >{{ pg }}</button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="setPage(pagination.current_page + 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div
        v-if="rejecting"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="rejecting = false"
      >
        <div class="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Reject Request</h3>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              @click="rejecting = false"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Reject medication request for <span class="font-semibold text-slate-900 dark:text-white">{{ resolveTranslatedValue(rejectTarget?.patient?.name, locale) }}</span>?
          </p>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rejection Notes <span class="text-red-500">*</span></label>
          <textarea
            v-model="rejectNotes"
            rows="3"
            placeholder="Provide a reason for rejection..."
            class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400/40 resize-none"
          ></textarea>
          <div class="flex items-center justify-end gap-3 mt-5">
            <button
              class="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              @click="rejecting = false"
            >Cancel</button>
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              :disabled="!rejectNotes.trim() || rejectSubmitting"
              @click="submitReject"
            >
              <span v-if="rejectSubmitting" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              {{ rejectSubmitting ? 'Rejecting...' : 'Reject Request' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
