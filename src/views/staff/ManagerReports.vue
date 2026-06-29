<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFacilityReportsStore } from '@/stores/facilityReports';
import FacilityReportFilters from '@/components/facility/FacilityReportFilters.vue';
import ExportButtons from '@/components/dashboard/global/ExportButtons.vue';
import SectionHeader from '@/components/dashboard/global/SectionHeader.vue';
import ChartCard from '@/components/dashboard/global/ChartCard.vue';
import BaseTable from '@/components/dashboard/global/BaseTable.vue';
import BaseSearch from '@/components/dashboard/global/BaseSearch.vue';
import BasePagination from '@/components/dashboard/global/BasePagination.vue';
import BaseLoading from '@/components/dashboard/global/BaseLoading.vue';
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue';

const { t } = useI18n();
const store = useFacilityReportsStore();

const searchQueries = ref({});

function getSearchKey(tIdx) {
  return `table_${tIdx}`;
}

const filteredTables = computed(() => {
  return (store.tables || []).map((table, tIdx) => {
    const q = (searchQueries.value[getSearchKey(tIdx)] || '').toLowerCase();
    if (!q) return { ...table, filteredRows: table.rows || [] };
    const cols = (table.columns || []).map(c => c.key);
    const filtered = (table.rows || []).filter(row =>
      cols.some(key => String(row[key] || '').toLowerCase().includes(q))
    );
    return { ...table, filteredRows: filtered };
  });
});

function sortTable(table, colKey) {
  const sort = table._sort;
  if (sort?.key === colKey) {
    sort.asc = !sort.asc;
  } else {
    table._sort = { key: colKey, asc: true };
  }
  const dir = table._sort.asc ? 1 : -1;
  table.filteredRows.sort((a, b) => {
    const va = a[colKey], vb = b[colKey];
    if (va == null) return 1;
    if (vb == null) return -1;
    return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
  });
}

const tablePage = ref({});

function setPage(tIdx, page) {
  tablePage.value[tIdx] = page;
}

function pageRows(table, tIdx) {
  const p = tablePage.value[tIdx] || 1;
  const per = table.pagination?.perPage || 10;
  const start = (p - 1) * per;
  return (table.filteredRows || []).slice(start, start + per);
}

function totalPages(table) {
  const total = (table.filteredRows || []).length;
  const per = table.pagination?.perPage || 10;
  return Math.max(1, Math.ceil(total / per));
}

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
      <div v-if="Object.keys(store.overview).length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(value, key) in store.overview"
          :key="key"
          class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
        >
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            {{ key.replace(/_/g, ' ') }}
          </p>
          <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ value }}</h3>
        </div>
      </div>

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
      <template v-for="(table, tIdx) in filteredTables" :key="tIdx">
        <div class="space-y-4">
          <SectionHeader :title="table.title || `Report Table ${tIdx + 1}`">
            <template #actions>
              <div class="flex items-center gap-3">
                <BaseSearch
                  v-model="searchQueries[getSearchKey(tIdx)]"
                  placeholder="Search table..."
                />
              </div>
            </template>
          </SectionHeader>

          <BaseTable
            :columns="table.columns || []"
            :items="pageRows(table, tIdx)"
            :loading="store.loading"
          >
            <template
              v-for="col in (table.columns || [])"
              :key="col.key"
              #[`cell(${col.key})`]="{ item }"
            >
              <button
                v-if="col.sortable"
                class="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300"
                @click="sortTable(table, col.key)"
              >
                {{ item[col.key] }}
                <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              <span
                v-else-if="col.type === 'badge'"
                class="inline-flex items-center gap-1.5"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="{
                    'bg-emerald-500': ['active','approved','completed'].includes(item[col.key]),
                    'bg-amber-500': item[col.key] === 'pending',
                    'bg-rose-500': ['cancelled','rejected'].includes(item[col.key]),
                    'bg-slate-300 dark:bg-slate-600': !item[col.key],
                  }"
                />
                <span class="text-sm capitalize text-slate-700 dark:text-slate-300">{{ item[col.key] }}</span>
              </span>
              <span v-else class="text-sm text-slate-700 dark:text-slate-300">{{ item[col.key] }}</span>
            </template>

            <template #empty>
              <BaseEmptyState />
            </template>
          </BaseTable>

          <BasePagination
            v-if="totalPages(table) > 1"
            :current-page="tablePage[tIdx] || 1"
            :total-pages="totalPages(table)"
            :total-items="(table.filteredRows || []).length"
            :items-per-page="table.pagination?.perPage || 10"
            @change="setPage(tIdx, $event)"
          />
        </div>
      </template>

      <!-- Empty overview + charts + tables -->
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
