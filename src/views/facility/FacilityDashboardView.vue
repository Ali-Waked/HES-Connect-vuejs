<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useStaffStore } from '@/stores/useStaffStore';
import { useFacilityDashboardStore } from '@/stores/facilityDashboard';
import { resolveTranslatedValue } from '@/utils/locale';
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue';
import GrowthBadge from '@/components/dashboard/global/GrowthBadge.vue';
import ChartCard from '@/components/dashboard/global/ChartCard.vue';
import SectionHeader from '@/components/dashboard/global/SectionHeader.vue';
import BaseTable from '@/components/dashboard/global/BaseTable.vue';
import BaseLoading from '@/components/dashboard/global/BaseLoading.vue';
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const staffStore = useStaffStore();
const dash = useFacilityDashboardStore();

const userName = computed(() => {
  const user = authStore.user || staffStore.currentUser;
  return resolveTranslatedValue(user?.name) || 'User';
});

const welcomeGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

function cellValue(item, key) {
  const val = item[key];
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
    return new Date(val).toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return resolveTranslatedValue(val, locale.value);
}

function statusClass(val) {
  const v = String(resolveTranslatedValue(val, locale.value)).toLowerCase();
  if (['active', 'approved', 'completed', 'confirmed'].includes(v)) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
  if (['pending', 'scheduled', 'booked'].includes(v)) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
  if (['cancelled', 'rejected', 'suspended', 'archived'].includes(v)) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
}

onMounted(() => {
  if (!dash.hasData) {
    dash.fetchDashboard();
  }
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {{ welcomeGreeting }}, {{ userName }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ t('staffSidebar.dashboard') }} &mdash; {{ new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </div>
      <button
        @click="dash.refreshDashboard()"
        :disabled="dash.loading"
        class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': dash.loading }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ dash.loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <BaseLoading v-if="dash.loading && !dash.hasData" />

    <!-- Error State -->
    <div v-else-if="dash.error && !dash.hasData" class="text-center py-16">
      <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">error_outline</span>
      <p class="text-sm font-bold text-rose-600 dark:text-rose-400">{{ dash.error }}</p>
      <button
        @click="dash.fetchDashboard()"
        class="mt-4 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition"
      >
        Retry
      </button>
    </div>

    <!-- Dashboard Content -->
    <template v-else-if="dash.hasData">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="(card, idx) in dash.combinedCards"
          :key="idx"
          class="relative"
        >
          <StatisticsCard
            :title="card.title"
            :value="card.value"
            :icon="card.icon"
            :color="card.color"
          />
          <div
            v-if="card.growth !== null"
            class="absolute top-3 right-3"
          >
            <GrowthBadge :value="card.growth" />
          </div>
        </div>
      </div>

      <!-- Charts -->
      <template v-if="dash.charts.length">
        <SectionHeader title="Charts & Analytics" subtitle="Visual overview of your data" />
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard
            v-for="(chart, idx) in dash.charts"
            :key="idx"
            :chart="chart"
          />
        </div>
      </template>

      <!-- Top Rankings Tables -->
      <template v-if="dash.topTables.length">
        <SectionHeader title="Top Rankings" subtitle="Leading items by count" />
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div v-for="(table, tIdx) in dash.topTables" :key="'top-' + tIdx" class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ table.title }}</h4>
            <BaseTable :columns="table.columns" :items="table.rows" :loading="false">
              <template v-for="col in table.columns" :key="col.key" #[`cell(${col.key})`]="{ item }">
                <span
                  v-if="col.key === 'status'"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="statusClass(item[col.key])"
                >
                  {{ cellValue(item, col.key) }}
                </span>
                <span v-else class="text-sm text-slate-700 dark:text-slate-300">
                  {{ cellValue(item, col.key) }}
                </span>
              </template>
              <template #empty>
                <BaseEmptyState />
              </template>
            </BaseTable>
          </div>
        </div>
      </template>

      <!-- Recent Data Tables -->
      <template v-if="dash.recentTables.length">
        <SectionHeader title="Recent Records" subtitle="Latest entries across modules" />
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div v-for="(table, tIdx) in dash.recentTables" :key="'recent-' + tIdx" class="space-y-3">
            <SectionHeader :title="table.title">
              <template #actions>
                <span class="text-xs text-slate-400">Total: {{ table.rows.length }}</span>
              </template>
            </SectionHeader>
            <BaseTable :columns="table.columns" :items="table.rows" :loading="false">
              <template v-for="col in table.columns" :key="col.key" #[`cell(${col.key})`]="{ item }">
                <span
                  v-if="col.key === 'status'"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="statusClass(item[col.key])"
                >
                  {{ cellValue(item, col.key) }}
                </span>
                <span v-else class="text-sm text-slate-700 dark:text-slate-300">
                  {{ cellValue(item, col.key) }}
                </span>
              </template>
              <template #empty>
                <BaseEmptyState />
              </template>
            </BaseTable>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
