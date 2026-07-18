<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReportsStore } from '../../stores/reports';
import ReportFilterBar from '../../components/dashboard/global/ReportFilterBar.vue';
import OverviewCards from '../../components/dashboard/global/OverviewCards.vue';
import ChartCard from '../../components/dashboard/global/ChartCard.vue';
import BaseTable from '../../components/dashboard/global/BaseTable.vue';
import SectionHeader from '../../components/dashboard/global/SectionHeader.vue';
import BaseLoading from '../../components/dashboard/global/BaseLoading.vue';

const { t } = useI18n();
const store = useReportsStore();

onMounted(async() => {
  if (!store.hasData) {
    await store.fetchReports();
  }
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.systemReports') }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('pageTitles.reportsDesc') }}</p>
    </div>

    <!-- Filters -->
    <ReportFilterBar
      :filters="store.filters"
      @update:filters="store.filters = $event"
      @apply="store.applyFilters()"
      @reset="store.resetFilters(); store.applyFilters()"
    />

    <!-- Loading -->
    <BaseLoading v-if="store.loading && !store.hasData" />

    <!-- Error -->
    <div v-else-if="store.error && !store.hasData" class="text-center py-12">
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
      <OverviewCards
        v-if="Object.keys(store.overview).length > 0"
        :overview="store.overview"
      />

      <!-- Charts -->
      <template v-if="store.charts.length > 0">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard
            v-for="(chart, idx) in store.charts"
            :key="idx"
            :chart="chart"
          />
        </div>
      </template>

      <!-- Tables -->
      <template v-for="(table, tIdx) in store.tables" :key="tIdx">
        <div class="space-y-4">
          <SectionHeader :title="table.title || ''">
            <template v-if="table.pagination" #actions>
              <span class="text-xs text-slate-400 dark:text-slate-500">
                {{ (table.pagination.currentPage - 1) * (table.pagination.perPage || 10) + 1 }}–{{ Math.min(table.pagination.currentPage * (table.pagination.perPage || 10), table.pagination.total) }} {{ t('common.of') }} {{ table.pagination.total }}
              </span>
            </template>
          </SectionHeader>
          <BaseTable
            :columns="table.columns || []"
            :items="table.rows || []"
            :loading="store.loading"
          >
            <template
              v-for="col in (table.columns || [])"
              :key="col.key"
              #[`cell(${col.key})`]="{ item }"
            >
            <!-- {{ col }} -->
              <span v-if="col.key === 'status'" class="inline-flex items-center gap-1.5">
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="{
                    'bg-emerald-500': item[col.key] === 'active' || item[col.key] === 'approved' || item[col.key] === 'completed' || item[col.key] === 'published',
                    'bg-amber-500': item[col.key] === 'pending',
                    'bg-rose-500': item[col.key] === 'cancelled' || item[col.key] === 'rejected',
                    'bg-slate-300 dark:bg-slate-600': !item[col.key],
                  }"
                />
                <span class="text-sm capitalize text-slate-700 dark:text-slate-300">{{ item[col.key] }}</span>
              </span>
              <span v-else class="text-sm text-slate-700 dark:text-slate-300">{{ item[col.key] }}</span>
            </template>
          </BaseTable>
        </div>
      </template>

      <!-- Empty state when no data sections exist -->
      <div
        v-if="Object.keys(store.overview).length === 0 && store.charts.length === 0 && store.tables.length === 0"
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
