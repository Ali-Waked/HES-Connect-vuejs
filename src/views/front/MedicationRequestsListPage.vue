<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Medication Requests</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your pharmacy medication requests</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1 max-w-sm">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by pharmacy name..."
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none transition shadow-sm"
            @input="onSearchInput"
          />
        </div>
        <select
          v-model="statusFilter"
          class="min-w-[150px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition cursor-pointer shadow-sm"
          @change="onFilterChange"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 4" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div class="flex-1 space-y-3">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              <div class="flex gap-2">
                <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-red-400 mb-2">error_outline</span>
        <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        <button class="mt-3 text-sm font-semibold text-brand-primary cursor-pointer" @click="fetchRequests">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!requests.length" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">medication</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">No medication requests found</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ hasActiveFilters ? 'Try adjusting your search or filters' : 'Medication requests will appear here once a pharmacy is selected' }}</p>
        <button v-if="hasActiveFilters" class="mt-4 text-sm font-semibold text-brand-primary hover:underline cursor-pointer" @click="resetFilters">Clear filters</button>
      </div>

      <!-- List -->
      <div v-else class="space-y-3">
        <div v-for="item in requests" :key="item.uuid"
          class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200 cursor-pointer"
          @click="$router.push(`/medication-requests/${item.uuid}`)">
          <div class="flex items-start gap-4">
            <img v-if="item.facility?.cover_image" :src="item.facility.cover_image" :alt="resolveTranslatedValue(item.facility?.name, locale)" class="w-12 h-12 rounded-xl object-cover shrink-0" />
            <div v-else class="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-brand-primary text-xl">local_pharmacy</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(item.facility?.name, locale) || 'Pharmacy' }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{{ shortUuid(item.uuid) }}</p>
                </div>
                <span class="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="statusClass(item.status)">
                  {{ item.status }}
                </span>
              </div>
              <div class="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">calendar_today</span>
                  {{ formatDate(item.created_at) }}
                </span>
                <span v-if="item.prescription?.uuid" class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">description</span>
                  Rx {{ shortUuid(item.prescription.uuid) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0 && !loading" class="flex items-center justify-center gap-2 mt-8">
        <button :disabled="pagination.current_page <= 1"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page - 1)">
          Prev
        </button>
        <div class="flex items-center gap-1">
          <button v-for="p in visiblePages" :key="p"
            class="w-9 h-9 rounded-lg text-sm font-semibold transition cursor-pointer"
            :class="p === pagination.current_page ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'"
            @click="setPage(p)">{{ p }}</button>
        </div>
        <button :disabled="pagination.current_page >= pagination.last_page"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page + 1)">
          Next
        </button>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import { getMedicationRequests } from '@/services/medicationRequestService'
import { resolveTranslatedValue } from '@/utils/locale'

const router = useRouter()
const { locale } = useI18n()

const requests = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
const searchQuery = ref('')
const statusFilter = ref('')

let searchTimeout

const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value
})

const visiblePages = computed(() => {
  const total = pagination.value.last_page
  const current = pagination.value.current_page
  const pages = []
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function statusClass(status) {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'cancelled': return 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
    default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.current_page = 1
    fetchRequests()
  }, 400)
}

function onFilterChange() {
  pagination.value.current_page = 1
  fetchRequests()
}

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  pagination.value.current_page = 1
  fetchRequests()
}

function setPage(page) {
  pagination.value.current_page = page
  fetchRequests()
}

async function fetchRequests() {
  loading.value = true
  error.value = null
  try {
    const params = { page: pagination.value.current_page }
    if (statusFilter.value) params.status = statusFilter.value
    if (searchQuery.value) params.search = searchQuery.value
    const res = await getMedicationRequests(params)
    const paginator = res.data?.data || res.data || {}
    requests.value = paginator.data || []
    pagination.value = {
      current_page: paginator.current_page || 1,
      last_page: paginator.last_page || 1,
      per_page: paginator.per_page || 10,
      total: paginator.total || 0,
    }
  } catch (err) {
    if (err.response?.status === 401) {
      router.push('/login')
      return
    }
    error.value = err.response?.data?.message || 'Failed to load medication requests'
    requests.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchRequests)
</script>
