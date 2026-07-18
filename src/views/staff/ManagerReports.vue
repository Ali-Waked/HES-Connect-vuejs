<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFacilityReportsStore } from '@/stores/facilityReports';
import FacilityReportFilters from '@/components/facility/FacilityReportFilters.vue';
import ExportButtons from '@/components/dashboard/global/ExportButtons.vue';
import SectionHeader from '@/components/dashboard/global/SectionHeader.vue';
import ChartCard from '@/components/dashboard/global/ChartCard.vue';
import BaseTable from '@/components/dashboard/global/BaseTable.vue';
import BaseLoading from '@/components/dashboard/global/BaseLoading.vue';
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue';

const { t } = useI18n();
const store = useFacilityReportsStore();

const cardMeta = {
  total_appointments: { icon: 'calendar_month', label: 'Appointments' },
  total_articles: { icon: 'article', label: 'Articles' },
  total_categories: { icon: 'category', label: 'Categories' },
  total_departments: { icon: 'business', label: 'Departments' },
  total_doctors: { icon: 'stethoscope', label: 'Doctors' },
  total_donations: { icon: 'volunteer_activism', label: 'Donations' },
  total_job_posts: { icon: 'work', label: 'Job Posts' },
  total_patients: { icon: 'group', label: 'Patients' },
  total_staff: { icon: 'badge', label: 'Staff' },
  total_stories: { icon: 'auto_stories', label: 'Stories' },
};

const growthMap = {
  appointments_growth: { label: 'Appointments' },
  articles_growth: { label: 'Articles' },
  categories_growth: { label: 'Categories' },
  departments_growth: { label: 'Departments' },
  doctors_growth: { label: 'Doctors' },
  donations_growth: { label: 'Donations' },
  job_posts_growth: { label: 'Job Posts' },
  patients_growth: { label: 'Patients' },
  staff_growth: { label: 'Staff' },
  stories_growth: { label: 'Stories' },
};

const overviewEntries = computed(() => {
  return Object.entries(store.overview).map(([key, value]) => {
    const meta = cardMeta[key] || {};
    return { key, value, icon: meta.icon || 'bar_chart', label: meta.label || key.replace(/_/g, ' ') };
  });
});

const growthEntries = computed(() => {
  return Object.entries(store.growthPercentages).map(([key, value]) => {
    const meta = growthMap[key] || {};
    return { key, value: Number(value), label: meta.label || key.replace(/_/g, ' ') };
  });
});

onMounted(() => {
  if (!store.hasData) {
    store.fetchReports();
  }
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('staffSidebar.reports') }}</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Analytics and insights</p>
      </div>
      <ExportButtons
        :loading-excel="store.exporting.excel"
        :loading-pdf="store.exporting.pdf"
        @export-excel="store.exportToExcel()"
        @export-pdf="store.exportToPdf()"
      />
    </div>

    <!-- Filters -->
    <FacilityReportFilters
      :filters="store.filters"
      @update:filters="store.filters = $event"
      @apply="store.applyFilters()"
      @reset="store.resetFilters(); store.applyFilters()"
    />

    <!-- Loading -->
    <BaseLoading v-if="store.loading && !store.hasData" />

    <!-- Error -->
    <div v-else-if="store.error && !store.hasData" class="text-center py-16">
      <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">error_outline</span>
      <p class="text-sm font-bold text-rose-600 dark:text-rose-400">{{ store.error }}</p>
      <button
        @click="store.fetchReports()"
        class="mt-4 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition"
      >
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Content -->
    <template v-else-if="store.hasData">
      <!-- Overview Cards -->
      <div v-if="overviewEntries.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          v-for="card in overviewEntries"
          :key="card.key"
          class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-lg text-slate-400 dark:text-slate-500">{{ card.icon }}</span>
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ card.label }}</p>
          </div>
          <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ card.value }}</h3>
        </div>
      </div>

      <!-- Growth Percentages -->
      <div v-if="growthEntries.length" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <SectionHeader title="Growth" subtitle="Percentage change compared to previous period" />
        <div class="flex flex-wrap gap-3 mt-4">
          <div
            v-for="g in growthEntries"
            :key="g.key"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            :class="g.value >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'"
          >
            <span class="text-slate-500 dark:text-slate-400 font-medium">{{ g.label }}</span>
            <span>{{ g.value >= 0 ? '+' : '' }}{{ g.value }}%</span>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <template v-if="store.charts.length">
        <SectionHeader title="Charts" subtitle="Visual analytics" />
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard
            v-for="(chart, idx) in store.charts"
            :key="idx"
            :chart="chart"
          />
        </div>
      </template>

      <!-- Top Items Tables -->
      <template v-if="store.topTables.length">
        <SectionHeader title="Top Rankings" subtitle="Leading items by count" />
        <div class="space-y-6">
          <div v-for="(table, tIdx) in store.topTables" :key="'top-' + tIdx" class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ table.title }}</h4>
            <BaseTable :columns="table.columns" :items="table.rows" :loading="false">
              <template #empty>
                <BaseEmptyState />
              </template>
            </BaseTable>
          </div>
        </div>
      </template>

      <!-- Recent Data Tables -->
      <template v-if="store.recentTables.length">
        <SectionHeader title="Recent Data" subtitle="Latest records across modules" />
        <div class="space-y-6">
          <div v-for="(table, tIdx) in store.recentTables" :key="'recent-' + tIdx" class="space-y-3">
            <SectionHeader :title="table.title">
              <template #actions>
                <span class="text-xs text-slate-400">Total: {{ table.rows.length }}</span>
              </template>
            </SectionHeader>
            <BaseTable :columns="table.columns" :items="table.rows" :loading="false">
              <template #empty>
                <BaseEmptyState />
              </template>
            </BaseTable>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div
        v-if="!overviewEntries.length && !store.charts.length && !store.recentTables.length"
        class="text-center py-16"
      >
        <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">bar_chart</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('common.noData') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('common.resetFilters') }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
