<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMedicationRequests } from '../../composables/useMedicationRequests'
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue'
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue'
import BasePagination from '../../components/dashboard/global/BasePagination.vue'
import BaseEmptyState from '../../components/dashboard/global/BaseEmptyState.vue'
import { useI18n } from 'vue-i18n'
import { useFormatDate } from '../../composables/useFormatDate'
import { resolveTranslatedValue } from '@/utils/locale'

const { t, locale } = useI18n()
const { formatDate } = useFormatDate()

const {
  requests,
  loading,
  error,
  pagination,
  filters,
  hasActiveFilters,
  fetchRequests,
  setPage,
  setFilter,
  resetFilters,
} = useMedicationRequests()

const showDetailModal = ref(false)
const selectedRequest = ref(null)
const menuOpen = ref(null)

function viewDetails(item) {
  selectedRequest.value = item
  showDetailModal.value = true
}

function closeDetails() {
  showDetailModal.value = false
  selectedRequest.value = null
}

function toggleMenu(uuid) {
  menuOpen.value = menuOpen.value === uuid ? null : uuid
}

function resolveName(field) {
  if (!field) return '—'
  if (typeof field === 'string') return field
  return resolveTranslatedValue(field.name || field, locale.value) || '—'
}

function getAvatar(field) {
  if (!field || typeof field === 'string') return null
  return field.avatar || null
}

function getInitials(name) {
  if (!name || name === '—') return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

const statusTabOptions = [
  { key: '', labelKey: 'medicationRequests.all', fallback: 'All' },
  { key: 'pending', labelKey: 'medicationRequests.pending', fallback: 'Pending' },
  { key: 'approved', labelKey: 'medicationRequests.approved', fallback: 'Approved' },
  { key: 'rejected', labelKey: 'medicationRequests.rejected', fallback: 'Rejected' },
  { key: 'dispensed', labelKey: 'medicationRequests.dispensed', fallback: 'Dispensed' },
]

function getTabLabel(tab) {
  return t(tab.labelKey) || tab.fallback
}

function getStatusCounts() {
  const total = pagination.value.total || 0
  return {
    total,
  }
}

let searchTimeout

function onSearchInput(val) {
  filters.value.search = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    setFilter('search', val)
  }, 400)
}

function handleClickOutside(e) {
  if (menuOpen.value && !e.target.closest('[data-menu]')) {
    menuOpen.value = null
  }
}

onMounted(() => {
  fetchRequests()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('medicationRequests.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('medicationRequests.subtitle') }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard
        :title="t('medicationRequests.totalRequests') || 'Total Requests'"
        :value="pagination.total"
        icon="inventory_2"
        color="primary"
      />
      <StatisticsCard
        :title="t('medicationRequests.pendingCount') || 'Pending'"
        :value="requests.filter(r => r.status === 'pending').length"
        icon="hourglass_empty"
        color="warning"
      />
      <StatisticsCard
        :title="t('medicationRequests.approvedCount') || 'Approved'"
        :value="requests.filter(r => r.status === 'approved').length"
        icon="check_circle"
        color="success"
      />
      <StatisticsCard
        :title="t('medicationRequests.dispensedCount') || 'Dispensed'"
        :value="requests.filter(r => r.status === 'dispensed').length"
        icon="medication"
        color="info"
      />
    </div>

    <!-- Controls -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div class="flex-1 w-full sm:w-auto">
        <BaseSearch
          :model-value="filters.search"
          :placeholder="t('medicationRequests.searchPlaceholder') || 'Search by patient name or request ID...'"
          @update:model-value="onSearchInput"
        />
      </div>
      <div class="flex gap-1.5 flex-wrap">
        <button
          v-for="tab in statusTabOptions"
          :key="tab.key"
          class="rounded-lg px-3.5 py-2 text-xs font-bold transition cursor-pointer"
          :class="filters.status === tab.key
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
          @click="setFilter('status', tab.key)"
        >
          {{ getTabLabel(tab) }}
        </button>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-if="error"
      class="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-center justify-between"
    >
      <div class="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
      <button
        class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline transition cursor-pointer"
        @click="fetchRequests()"
      >
        {{ t('common.retry') || 'Retry' }}
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="p-5 space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div class="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
          </div>
          <div class="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden lg:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[120px]">{{ t('medicationRequests.requestId') || 'Request ID' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('medicationRequests.patient') || 'Patient' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('medicationRequests.pharmacy') || 'Pharmacy' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('medicationRequests.prescription') || 'Prescription' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[110px]">{{ t('medicationRequests.status') || 'Status' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[130px]">{{ t('medicationRequests.created') || 'Created' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[130px]">{{ t('medicationRequests.dispensedAt') || 'Dispensed' }}</th>
              <th class="px-6 py-3.5 w-[50px]"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <template v-if="requests.length > 0">
              <tr
                v-for="item in requests"
                :key="item.uuid"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <td class="px-6 py-4">
                  <span class="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">{{ shortUuid(item.uuid) }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div v-if="getAvatar(item.patient?.user || item.patient)" class="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-900">
                      <img :src="getAvatar(item.patient?.user || item.patient)" :alt="resolveName(item.patient?.user || item.patient)" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-900">
                      <span class="text-xs font-bold text-brand-primary">{{ getInitials(resolveName(item.patient?.user || item.patient)) }}</span>
                    </div>
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(item.patient?.user || item.patient) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-600 dark:text-slate-400">{{ resolveName(item.pharmacy) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span v-if="item.prescription?.uuid" class="text-xs font-mono text-slate-500 dark:text-slate-400">{{ shortUuid(item.prescription.uuid) }}</span>
                  <span v-else class="text-xs text-slate-400 dark:text-slate-500">—</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                    :class="{
                      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400': item.status === 'pending',
                      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400': item.status === 'approved',
                      'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400': item.status === 'rejected',
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400': item.status === 'dispensed',
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': !['pending','approved','rejected','dispensed'].includes(item.status),
                    }"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="{
                        'bg-amber-500': item.status === 'pending',
                        'bg-emerald-500': item.status === 'approved',
                        'bg-rose-500': item.status === 'rejected',
                        'bg-blue-500': item.status === 'dispensed',
                        'bg-slate-400': !['pending','approved','rejected','dispensed'].includes(item.status),
                      }"
                    ></span>
                    {{ item.status || '—' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{{ formatDate(item.created_at) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{{ item.dispensed_at ? formatDate(item.dispensed_at) : '—' }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="relative" data-menu>
                    <button
                      class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100"
                      @click.stop="toggleMenu(item.uuid)"
                    >
                      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/>
                      </svg>
                    </button>
                    <div
                      v-if="menuOpen === item.uuid"
                      class="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-1"
                    >
                      <button
                        class="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center gap-2.5 cursor-pointer"
                        @click="viewDetails(item); menuOpen = null"
                      >
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        {{ t('medicationRequests.viewDetails') || 'View Details' }}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="8" class="px-6 py-12">
                <BaseEmptyState
                  v-if="hasActiveFilters"
                  :title="t('medicationRequests.noResults') || 'No medication requests found'"
                  :description="t('medicationRequests.noResultsDesc') || 'Try adjusting your search or filters'"
                  @reset="resetFilters"
                />
                <BaseEmptyState
                  v-else
                  icon="medication"
                  :title="t('medicationRequests.emptyTitle') || 'No medication requests yet'"
                  :description="t('medicationRequests.emptyDesc') || 'Medication requests will appear here once patients submit them'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!loading" class="lg:hidden space-y-3">
      <template v-if="requests.length > 0">
        <div
          v-for="item in requests"
          :key="item.uuid"
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm active:bg-slate-50 dark:active:bg-slate-800 transition cursor-pointer"
          @click="viewDetails(item)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div v-if="getAvatar(item.patient?.user || item.patient)" class="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img :src="getAvatar(item.patient?.user || item.patient)" :alt="resolveName(item.patient?.user || item.patient)" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                <span class="text-sm font-bold text-brand-primary">{{ getInitials(resolveName(item.patient?.user || item.patient)) }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(item.patient?.user || item.patient) }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ shortUuid(item.uuid) }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
              :class="{
                'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400': item.status === 'pending',
                'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400': item.status === 'approved',
                'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400': item.status === 'rejected',
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400': item.status === 'dispensed',
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': !['pending','approved','rejected','dispensed'].includes(item.status),
              }"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-amber-500': item.status === 'pending',
                  'bg-emerald-500': item.status === 'approved',
                  'bg-rose-500': item.status === 'rejected',
                  'bg-blue-500': item.status === 'dispensed',
                  'bg-slate-400': !['pending','approved','rejected','dispensed'].includes(item.status),
                }"
              ></span>
              {{ item.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p class="text-slate-400 dark:text-slate-500 mb-0.5">{{ t('medicationRequests.pharmacy') || 'Pharmacy' }}</p>
              <p class="font-medium text-slate-700 dark:text-slate-300 truncate">{{ resolveName(item.pharmacy) }}</p>
            </div>
            <div>
              <p class="text-slate-400 dark:text-slate-500 mb-0.5">{{ t('medicationRequests.prescription') || 'Prescription' }}</p>
              <p class="font-medium text-slate-700 dark:text-slate-300 font-mono text-xs">{{ item.prescription?.uuid ? shortUuid(item.prescription.uuid) : '—' }}</p>
            </div>
            <div>
              <p class="text-slate-400 dark:text-slate-500 mb-0.5">{{ t('medicationRequests.created') || 'Created' }}</p>
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ formatDate(item.created_at) }}</p>
            </div>
            <div>
              <p class="text-slate-400 dark:text-slate-500 mb-0.5">{{ t('medicationRequests.dispensedAt') || 'Dispensed' }}</p>
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ item.dispensed_at ? formatDate(item.dispensed_at) : '—' }}</p>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="py-12">
        <BaseEmptyState
          v-if="hasActiveFilters"
          :title="t('medicationRequests.noResults') || 'No medication requests found'"
          :description="t('medicationRequests.noResultsDesc') || 'Try adjusting your search or filters'"
          @reset="resetFilters"
        />
        <BaseEmptyState
          v-else
          icon="medication"
          :title="t('medicationRequests.emptyTitle') || 'No medication requests yet'"
          :description="t('medicationRequests.emptyDesc') || 'Medication requests will appear here once patients submit them'"
        />
      </div>
    </div>

    <!-- Pagination -->
    <BasePagination
      v-if="pagination.total > 0 && !loading"
      :current-page="pagination.current_page"
      :total-pages="pagination.last_page"
      :total-items="pagination.total"
      :items-per-page="pagination.per_page"
      @change="setPage"
    />

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedRequest"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
        @click.self="closeDetails"
      >
        <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
          <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('medicationRequests.details') || 'Request Details' }}</h3>
            <button
              class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
              @click="closeDetails"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5 overflow-y-auto flex-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('medicationRequests.requestId') || 'Request ID' }}</p>
                <p class="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">{{ selectedRequest.uuid || '—' }}</p>
              </div>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                :class="{
                  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400': selectedRequest.status === 'pending',
                  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400': selectedRequest.status === 'approved',
                  'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400': selectedRequest.status === 'rejected',
                  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400': selectedRequest.status === 'dispensed',
                  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': !['pending','approved','rejected','dispensed'].includes(selectedRequest.status),
                }"
              >
                {{ selectedRequest.status || '—' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('medicationRequests.patient') || 'Patient' }}</p>
                <div class="flex items-center gap-2">
                  <div v-if="getAvatar(selectedRequest.patient?.user || selectedRequest.patient)" class="w-7 h-7 rounded-full overflow-hidden shrink-0">
                    <img :src="getAvatar(selectedRequest.patient?.user || selectedRequest.patient)" :alt="resolveName(selectedRequest.patient?.user || selectedRequest.patient)" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-7 h-7 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                    <span class="text-[10px] font-bold text-brand-primary">{{ getInitials(resolveName(selectedRequest.patient?.user || selectedRequest.patient)) }}</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(selectedRequest.patient?.user || selectedRequest.patient) }}</p>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('medicationRequests.pharmacy') || 'Pharmacy' }}</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(selectedRequest.pharmacy) }}</p>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('medicationRequests.prescription') || 'Prescription' }}</p>
              <p v-if="selectedRequest.prescription?.uuid" class="text-sm font-mono font-semibold text-slate-900 dark:text-white">{{ selectedRequest.prescription.uuid }}</p>
              <p v-else class="text-sm text-slate-500 dark:text-slate-400">—</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('medicationRequests.createdDate') || 'Created' }}</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDate(selectedRequest.created_at) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('medicationRequests.dispensedDate') || 'Dispensed' }}</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ selectedRequest.dispensed_at ? formatDate(selectedRequest.dispensed_at) : '—' }}</p>
              </div>
            </div>

            <div v-if="selectedRequest.pharmacist" class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pharmacist</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(selectedRequest.pharmacist) }}</p>
            </div>

            <div v-if="selectedRequest.notes" class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('medicationRequests.notes') || 'Notes' }}</p>
              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 italic">
                "{{ selectedRequest.notes }}"
              </div>
            </div>
          </div>

          <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              @click="closeDetails"
            >
              {{ t('common.close') || 'Close' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
