<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePrescriptions } from '../../composables/usePrescriptions'
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue'
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue'
import BasePagination from '../../components/dashboard/global/BasePagination.vue'
import BaseEmptyState from '../../components/dashboard/global/BaseEmptyState.vue'
import PrescriptionDetailDialog from '../../components/dashboard/Prescriptions/PrescriptionDetailDialog.vue'
import { useI18n } from 'vue-i18n'
import { useFormatDate } from '../../composables/useFormatDate'
import { resolveTranslatedValue } from '@/utils/locale'

const { t, locale } = useI18n()
const { formatDate } = useFormatDate()

const {
  prescriptions,
  loading,
  error,
  pagination,
  filters,
  analytics,
  hasActiveFilters,
  loadAll,
  setPage,
  setFilter,
  resetFilters,
} = usePrescriptions()

const showDetailDialog = ref(false)
const selectedPrescription = ref(null)

function viewDetails(item) {
  selectedPrescription.value = item
  showDetailDialog.value = true
}

function closeDetails() {
  showDetailDialog.value = false
  selectedPrescription.value = null
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

const statusVariants = {
  active: 'success',
  dispensed: 'info',
  cancelled: 'danger',
  pending: 'warning',
  completed: 'primary',
  pharmacy_selected: 'info',
}

function getStatusVariant(status) {
  return statusVariants[status?.toLowerCase()] || 'neutral'
}

const statusDotColors = {
  active: 'bg-emerald-500',
  dispensed: 'bg-blue-500',
  cancelled: 'bg-rose-500',
  pending: 'bg-amber-500',
  completed: 'bg-brand-primary',
  pharmacy_selected: 'bg-blue-500',
}

function getStatusDotColor(status) {
  return statusDotColors[status?.toLowerCase()] || 'bg-slate-400'
}

let searchTimeout

function onSearchInput(val) {
  filters.value.search = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    setFilter('search', val)
  }, 400)
}

onMounted(() => {
  loadAll()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.prescriptions') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('pageTitles.prescriptionsDesc') }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard
        :title="t('prescriptions.total') || 'Total Prescriptions'"
        :value="analytics.total"
        icon="description"
        color="primary"
      />
      <StatisticsCard
        :title="t('prescriptions.active') || 'Active Prescriptions'"
        :value="analytics.active"
        icon="play_circle"
        color="success"
      />
      <StatisticsCard
        :title="t('prescriptions.dispensed') || 'Dispensed Prescriptions'"
        :value="analytics.dispensed"
        icon="medication"
        color="info"
      />
      <StatisticsCard
        :title="t('prescriptions.cancelled') || 'Cancelled Prescriptions'"
        :value="analytics.cancelled"
        icon="cancel"
        color="danger"
      />
    </div>

    <!-- Controls -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <BaseSearch
          :model-value="filters.search"
          :placeholder="t('prescriptions.searchPlaceholder') || 'Search by patient, doctor or UUID...'"
          @update:model-value="onSearchInput"
        />
      </div>
      <select
        :value="filters.status"
        class="min-w-[150px] px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer shadow-sm"
        @change="setFilter('status', $event.target.value)"
      >
        <option value="">{{ t('pageTitles.allStatus') || 'All Status' }}</option>
        <option value="active">{{ t('prescriptions.active') || 'Active' }}</option>
        <option value="dispensed">{{ t('prescriptions.dispensed') || 'Dispensed' }}</option>
        <option value="cancelled">{{ t('prescriptions.cancelled') || 'Cancelled' }}</option>
        <option value="pending">{{ t('statuses.pending') || 'Pending' }}</option>
      </select>
      <button
        v-if="hasActiveFilters"
        class="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer whitespace-nowrap"
        @click="resetFilters"
      >
        {{ t('common.resetFilters') || 'Reset' }}
      </button>
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
        @click="loadAll()"
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
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[130px]">{{ t('prescriptions.uuid') || 'UUID' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('prescriptions.patient') || 'Patient' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('prescriptions.pharmacist') || 'Pharmacist' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('prescriptions.pharmacy') || 'Pharmacy' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[100px]">{{ t('prescriptions.status') || 'Status' }}</th>
              <th class="px-6 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[130px]">{{ t('prescriptions.createdAt') || 'Created' }}</th>
              <th class="px-6 py-3.5 w-[50px]"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <template v-if="prescriptions.length > 0">
              <tr
                v-for="item in prescriptions"
                :key="item.uuid || item.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                @click="viewDetails(item)"
              >
                <td class="px-6 py-4">
                  <span class="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">{{ shortUuid(item.uuid || item.id) }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div v-if="getAvatar(item.patient)" class="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-900">
                      <img :src="getAvatar(item.patient)" :alt="resolveName(item.patient)" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-900">
                      <span class="text-xs font-bold text-brand-primary">{{ getInitials(resolveName(item.patient)) }}</span>
                    </div>
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(item.patient) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{{ resolveName(item.pharmacist) }}</td>
                <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{{ resolveName(item.pharmacy) }}</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                    :class="{
                      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400': item.status === 'active',
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400': item.status === 'dispensed' || item.status === 'pharmacy_selected',
                      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400': item.status === 'pending',
                      'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400': item.status === 'cancelled',
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': !['active','dispensed','pharmacy_selected','pending','cancelled'].includes(item.status),
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotColor(item.status)"></span>
                    {{ item.status || '—' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{{ formatDate(item.created_at || item.createdAt) }}</span>
                </td>
                <td class="px-6 py-4">
                  <button
                    class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100"
                    :title="t('prescriptions.viewDetails') || 'View Details'"
                    @click.stop="viewDetails(item)"
                  >
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="7" class="px-6 py-12">
                <BaseEmptyState
                  v-if="hasActiveFilters"
                  :title="t('prescriptions.noResults') || 'No prescriptions found'"
                  :description="t('prescriptions.noResultsDesc') || 'Try adjusting your search or filters'"
                  @reset="resetFilters"
                />
                <BaseEmptyState
                  v-else
                  icon="description"
                  :title="t('prescriptions.emptyTitle') || 'No prescriptions yet'"
                  :description="t('prescriptions.emptyDesc') || 'Prescriptions will appear here once they are issued'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!loading" class="lg:hidden space-y-3">
      <template v-if="prescriptions.length > 0">
        <div
          v-for="item in prescriptions"
          :key="item.uuid || item.id"
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm active:bg-slate-50 dark:active:bg-slate-800 transition cursor-pointer"
          @click="viewDetails(item)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div v-if="getAvatar(item.patient)" class="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img :src="getAvatar(item.patient)" :alt="resolveName(item.patient)" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                <span class="text-sm font-bold text-brand-primary">{{ getInitials(resolveName(item.patient)) }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(item.patient) }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ shortUuid(item.uuid || item.id) }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
              :class="{
                'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400': item.status === 'active',
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400': item.status === 'dispensed' || item.status === 'pharmacy_selected',
                'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400': item.status === 'pending',
                'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400': item.status === 'cancelled',
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': !['active','dispensed','pharmacy_selected','pending','cancelled'].includes(item.status),
              }"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotColor(item.status)"></span>
              {{ item.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p class="text-slate-400 dark:text-slate-500 mb-0.5">{{ t('prescriptions.pharmacist') || 'Pharmacist' }}</p>
              <p class="font-medium text-slate-700 dark:text-slate-300 truncate">{{ resolveName(item.pharmacist) }}</p>
            </div>
            <div>
              <p class="text-slate-400 dark:text-slate-500 mb-0.5">{{ t('prescriptions.pharmacy') || 'Pharmacy' }}</p>
              <p class="font-medium text-slate-700 dark:text-slate-300 truncate">{{ resolveName(item.pharmacy) }}</p>
            </div>
            <div>
              <p class="text-slate-400 dark:text-slate-500 mb-0.5">{{ t('prescriptions.createdAt') || 'Created' }}</p>
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ formatDate(item.created_at || item.createdAt) }}</p>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="py-12">
        <BaseEmptyState
          v-if="hasActiveFilters"
          :title="t('prescriptions.noResults') || 'No prescriptions found'"
          :description="t('prescriptions.noResultsDesc') || 'Try adjusting your search or filters'"
          @reset="resetFilters"
        />
        <BaseEmptyState
          v-else
          icon="description"
          :title="t('prescriptions.emptyTitle') || 'No prescriptions yet'"
          :description="t('prescriptions.emptyDesc') || 'Prescriptions will appear here once they are issued'"
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

    <!-- Detail dialog -->
    <PrescriptionDetailDialog
      :show="showDetailDialog"
      :prescription="selectedPrescription"
      @close="closeDetails"
    />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
