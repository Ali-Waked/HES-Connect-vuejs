<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminMedicationAnalyticsStore } from '@/stores/adminMedicationAnalytics'
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue'
import BaseTable from '@/components/dashboard/global/BaseTable.vue'
import ChartWrapper from '@/components/facility-owner/ChartWrapper.vue'

const { t } = useI18n()
const store = useAdminMedicationAnalyticsStore()

const kpiCards = computed(() => [
  { title: t('medicationAnalytics.totalRequests'), value: store.analytics.total_requests.toLocaleString(), icon: 'inventory_2', color: 'primary' },
  { title: t('medicationAnalytics.pendingRequests'), value: store.analytics.pending_requests.toLocaleString(), icon: 'hourglass_empty', color: 'warning' },
  { title: t('medicationAnalytics.approvedRequests'), value: store.analytics.approved_requests.toLocaleString(), icon: 'check_circle', color: 'success' },
  { title: t('medicationAnalytics.rejectedRequests'), value: store.analytics.rejected_requests.toLocaleString(), icon: 'cancel', color: 'danger' },
  { title: t('medicationAnalytics.approvalRate'), value: `${store.analytics.approval_rate}%`, icon: 'trending_up', color: 'info' },
])

const monthlyTrendChart = computed(() => ({
  labels: store.analytics.monthly_trend.map((d) => d.month || d.label || ''),
  datasets: [
    {
      label: t('medicationAnalytics.requests'),
      data: store.analytics.monthly_trend.map((d) => d.count || d.value || 0),
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
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1 },
    },
  },
}

const statusChart = computed(() => ({
  labels: store.analytics.status_distribution.map((d) => d.status || d.label || ''),
  datasets: [
    {
      data: store.analytics.status_distribution.map((d) => d.count || d.value || 0),
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
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

const pharmacyColumns = [
  { key: 'name', label: t('medicationAnalytics.pharmacy') },
  { key: 'requests', label: t('medicationAnalytics.requests') },
  { key: 'approval_rate', label: t('medicationAnalytics.approvalRate') },
]

const medicineColumns = [
  { key: 'name', label: t('medicationAnalytics.medicine') },
  { key: 'requests', label: t('medicationAnalytics.requests') },
]

const recentColumns = [
  { key: 'patient', label: t('medicationAnalytics.patient') },
  { key: 'pharmacy', label: t('medicationAnalytics.pharmacy') },
  { key: 'status', label: t('medicationAnalytics.status') },
  { key: 'date', label: t('medicationAnalytics.date') },
]

function statusClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (s === 'rejected') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
}

onMounted(() => {
  store.fetchAnalytics()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('medicationAnalytics.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('medicationAnalytics.subtitle') }}</p>
      </div>
    </div>

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

    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse">
        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 mb-4"></div>
        <div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded mb-2"></div>
        <div class="h-8 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatisticsCard
        v-for="kpi in kpiCards"
        :key="kpi.title"
        v-bind="kpi"
      />
    </div>

    <div v-if="store.loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="i in 2" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 animate-pulse">
        <div class="h-5 w-40 bg-slate-100 dark:bg-slate-700 rounded mb-6"></div>
        <div class="h-64 bg-slate-100 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-3">{{ t('medicationAnalytics.topPharmacies') }}</h3>
        <BaseTable
          :columns="pharmacyColumns"
          :items="store.analytics.top_pharmacies"
          :loading="store.loading"
        >
          <template #cell(approval_rate)="{ item }">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ item.approval_rate }}%</span>
          </template>
        </BaseTable>
      </div>

      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-3">{{ t('medicationAnalytics.mostRequestedMedicines') }}</h3>
        <BaseTable
          :columns="medicineColumns"
          :items="store.analytics.most_requested_medicines"
          :loading="store.loading"
        />
      </div>
    </div>

    <div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white mb-3">{{ t('medicationAnalytics.recentRequests') }}</h3>
      <BaseTable
        :columns="recentColumns"
        :items="store.analytics.recent_requests"
        :loading="store.loading"
      >
        <template #cell(status)="{ item }">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
            :class="statusClass(item.status)"
          >
            {{ item.status }}
          </span>
        </template>
        <template #cell(date)="{ item }">
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ item.date }}</span>
        </template>
      </BaseTable>
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
