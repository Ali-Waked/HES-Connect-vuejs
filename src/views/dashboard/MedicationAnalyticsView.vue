<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminMedicationAnalyticsStore } from '@/stores/adminMedicationAnalytics'
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue'
import ChartWrapper from '@/components/facility-owner/ChartWrapper.vue'
import { useFormatDate } from '@/composables/useFormatDate'
import { resolveTranslatedValue } from '@/utils/locale'

const { t, locale } = useI18n()
const { formatDate } = useFormatDate()
const store = useAdminMedicationAnalyticsStore()

const kpiCards = computed(() => [
  { title: t('medicationAnalytics.totalRequests'), value: store.analytics.total_requests.toLocaleString(), icon: 'inventory_2', color: 'primary' },
  { title: t('medicationAnalytics.pendingRequests'), value: store.analytics.pending_requests.toLocaleString(), icon: 'hourglass_empty', color: 'warning' },
  { title: t('medicationAnalytics.approvedRequests'), value: store.analytics.approved_requests.toLocaleString(), icon: 'check_circle', color: 'success' },
  { title: t('medicationAnalytics.rejectedRequests'), value: store.analytics.rejected_requests.toLocaleString(), icon: 'cancel', color: 'danger' },
  { title: t('medicationAnalytics.approvalRate'), value: `${store.analytics.approval_rate}%`, icon: 'trending_up', color: 'info' },
])

const monthlyTrendChart = computed(() => ({
  labels: store.analytics.monthly_trend.map((d) => d.month || d.label || d.period || ''),
  datasets: [
    {
      label: t('medicationAnalytics.requests'),
      data: store.analytics.monthly_trend.map((d) => d.count || d.value || d.total || 0),
      borderColor: '#027a75',
      backgroundColor: 'rgba(2, 122, 117, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#027a75',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    },
  ],
}))

const monthlyTrendOptions = {
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }, stepSize: 1 },
    },
  },
}

const statusChart = computed(() => ({
  labels: store.analytics.status_distribution.map((d) => d.status || d.label || d.name || ''),
  datasets: [
    {
      data: store.analytics.status_distribution.map((d) => d.count || d.value || d.total || 0),
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}))

const statusChartOptions = {
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        color: '#64748b',
        font: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
      },
    },
  },
}

const pharmacyBarChart = computed(() => ({
  labels: store.analytics.top_pharmacies.slice(0, 8).map((d) => resolveTranslatedValue(d.name, locale.value) || ''),
  datasets: [
    {
      label: t('medicationAnalytics.requests'),
      data: store.analytics.top_pharmacies.slice(0, 8).map((d) => d.requests || d.count || d.total || 0),
      backgroundColor: '#027a75',
      borderRadius: 6,
      maxBarThickness: 40,
    },
  ],
}))

const pharmacyBarOptions = {
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } },
    },
    y: {
      grid: { display: false },
      ticks: { color: '#64748b', font: { size: 12, family: "'Plus Jakarta Sans', sans-serif" } },
    },
  },
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
  if (s === 'rejected') return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
  if (s === 'dispensed') return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
  return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
}

function getStatusDot(status) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'bg-emerald-500'
  if (s === 'rejected') return 'bg-rose-500'
  if (s === 'dispensed') return 'bg-blue-500'
  return 'bg-amber-500'
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

onMounted(() => {
  store.fetchAnalytics()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('medicationAnalytics.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('medicationAnalytics.subtitle') }}</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="store.error" class="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-rose-500">error</span>
        <p class="text-sm font-medium text-rose-700 dark:text-rose-400">{{ store.error }}</p>
        <button
          class="ml-auto text-sm font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 cursor-pointer"
          @click="store.fetchAnalytics()"
        >
          {{ t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- KPI Cards Loading -->
    <div v-if="store.loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse">
        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 mb-4"></div>
        <div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded mb-2"></div>
        <div class="h-8 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatisticsCard
        v-for="kpi in kpiCards"
        :key="kpi.title"
        v-bind="kpi"
      />
    </div>

    <!-- Charts Loading -->
    <div v-if="store.loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="i in 2" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 animate-pulse">
        <div class="h-5 w-40 bg-slate-100 dark:bg-slate-700 rounded mb-6"></div>
        <div class="h-64 bg-slate-100 dark:bg-slate-700 rounded"></div>
      </div>
    </div>

    <!-- Charts Row: Monthly Trend + Status Distribution -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ t('medicationAnalytics.monthlyTrend') }}</h3>
        <ChartWrapper
          v-if="store.analytics.monthly_trend.length > 0"
          type="line"
          :data="monthlyTrendChart"
          :options="monthlyTrendOptions"
          height="h-64"
        />
        <div v-else class="h-64 flex items-center justify-center text-sm text-slate-400">
          {{ t('common.noData') }}
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ t('medicationAnalytics.statusDistribution') }}</h3>
        <ChartWrapper
          v-if="store.analytics.status_distribution.length > 0"
          type="doughnut"
          :data="statusChart"
          :options="statusChartOptions"
          height="h-64"
        />
        <div v-else class="h-64 flex items-center justify-center text-sm text-slate-400">
          {{ t('common.noData') }}
        </div>
      </div>
    </div>

    <!-- Top Pharmacies Bar Chart -->
    <div v-if="!store.loading && store.analytics.top_pharmacies.length > 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
      <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ t('medicationAnalytics.topPharmacies') }}</h3>
      <ChartWrapper
        type="bar"
        :data="pharmacyBarChart"
        :options="pharmacyBarOptions"
        :height="store.analytics.top_pharmacies.length > 5 ? 'h-80' : 'h-64'"
      />
    </div>

    <!-- Most Requested Medicines + Top Pharmacies Table -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Most Requested Medicines -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('medicationAnalytics.mostRequestedMedicines') }}</h3>
        </div>
        <div v-if="store.loading" class="p-6 space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 animate-pulse">
            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-2/3 bg-slate-100 dark:bg-slate-700 rounded"></div>
            </div>
            <div class="h-5 w-8 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>
        <div v-else-if="store.analytics.most_requested_medicines.length > 0" class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <div
            v-for="(med, idx) in store.analytics.most_requested_medicines"
            :key="med.uuid || idx"
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
          >
            <div class="w-8 h-8 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-brand-primary">{{ idx + 1 }}</span>
            </div>
            <span class="flex-1 text-sm font-medium text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(med.name, locale.value) || '—' }}</span>
            <span class="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              {{ med.requests || med.count || med.total || 0 }}
            </span>
          </div>
        </div>
        <div v-else class="p-12 text-center text-sm text-slate-400">{{ t('common.noData') }}</div>
      </div>

      <!-- Top Pharmacies Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('medicationAnalytics.topPharmacies') }}</h3>
        </div>
        <div v-if="store.loading" class="p-6 space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 animate-pulse">
            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-2/3 bg-slate-100 dark:bg-slate-700 rounded"></div>
            </div>
            <div class="h-5 w-8 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>
        <div v-else-if="store.analytics.top_pharmacies.length > 0" class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <div
            v-for="(pharmacy, idx) in store.analytics.top_pharmacies"
            :key="pharmacy.uuid || idx"
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
          >
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-blue-600 dark:text-blue-400">{{ idx + 1 }}</span>
            </div>
            <span class="flex-1 text-sm font-medium text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(pharmacy.name, locale.value) || '—' }}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ pharmacy.requests || pharmacy.count || pharmacy.total || 0 }} {{ t('medicationAnalytics.requests') }}</span>
              <span v-if="pharmacy.approval_rate != null" class="text-xs font-bold text-emerald-600 dark:text-emerald-400">{{ pharmacy.approval_rate }}%</span>
            </div>
          </div>
        </div>
        <div v-else class="p-12 text-center text-sm text-slate-400">{{ t('common.noData') }}</div>
      </div>
    </div>

    <!-- Recent Requests -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('medicationAnalytics.recentRequests') }}</h3>
      </div>
      <div v-if="store.loading" class="p-6 space-y-3">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/3 bg-slate-100 dark:bg-slate-700 rounded"></div>
            <div class="h-3 w-1/4 bg-slate-100 dark:bg-slate-700 rounded"></div>
          </div>
          <div class="h-6 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
      <div v-else-if="store.analytics.recent_requests.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
              <th class="px-6 py-3 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('medicationAnalytics.patient') || 'Patient' }}</th>
              <th class="px-6 py-3 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('medicationAnalytics.pharmacy') || 'Pharmacy' }}</th>
              <th class="px-6 py-3 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[110px]">{{ t('medicationAnalytics.status') || 'Status' }}</th>
              <th class="px-6 py-3 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[130px]">{{ t('medicationAnalytics.date') || 'Date' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <tr
              v-for="(req, idx) in store.analytics.recent_requests"
              :key="req.uuid || idx"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <td class="px-6 py-3.5">
                <div class="flex items-center gap-3">
                  <div v-if="req.patient?.user?.avatar || req.patient?.avatar" class="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img :src="req.patient?.user?.avatar || req.patient?.avatar" :alt="resolveTranslatedValue(req.patient?.user?.name || req.patient?.name, locale.value) || ''" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                    <span class="text-[10px] font-bold text-brand-primary">{{ (resolveTranslatedValue(req.patient?.user?.name || req.patient?.name, locale.value) || 'P')[0] }}</span>
                  </div>
                  <span class="font-medium text-slate-900 dark:text-white">{{ resolveTranslatedValue(req.patient?.user?.name || req.patient?.name || req.patient_name, locale.value) || '—' }}</span>
                </div>
              </td>
              <td class="px-6 py-3.5 text-slate-600 dark:text-slate-400">{{ resolveTranslatedValue(req.facility?.name || req.pharmacy?.name || req.pharmacy_name, locale.value) || '—' }}</td>
              <td class="px-6 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                  :class="getStatusClass(req.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDot(req.status)"></span>
                  {{ req.status || '—' }}
                </span>
              </td>
              <td class="px-6 py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{{ formatDate(req.date || req.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-12 text-center text-sm text-slate-400">{{ t('common.noData') }}</div>
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
