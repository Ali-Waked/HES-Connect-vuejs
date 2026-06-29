<script setup>
import { onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@/stores/useThemeStore';
import { useDashboardApiStore } from '../../stores/dashboardApi';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import GrowthBadge from '../../components/dashboard/global/GrowthBadge.vue';
import ChartCard from '../../components/dashboard/global/ChartCard.vue';
import RecentActivityCard from '../../components/dashboard/global/RecentActivityCard.vue';
import SectionHeader from '../../components/dashboard/global/SectionHeader.vue';
import BaseLoading from '../../components/dashboard/global/BaseLoading.vue';

const { t } = useI18n();
const themeStore = useThemeStore();
const dash = useDashboardApiStore();

onMounted(() => {
  if (!dash.hasData) {
    dash.fetchFromApi();
  }
});

const systemHealth = [
  { key: 'api', label: t('superAdmin.apiServer') },
  { key: 'db', label: t('superAdmin.database') },
  { key: 'storage', label: t('superAdmin.fileStorage') },
  { key: 'auth', label: t('superAdmin.authService') },
];

const recentKeys = computed(() => Object.keys(dash.recentActivity));

const chartSections = computed(() => {
  const timeSeries = [];
  const topLists = [];
  for (const chart of dash.charts) {
    if (chart.key?.startsWith('top_')) {
      topLists.push(chart);
    } else {
      timeSeries.push(chart);
    }
  }
  return { timeSeries, topLists };
});
</script>

<template>
  <div class="min-h-full space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('superAdmin.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{{ t('superAdmin.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="relative w-14 h-7 rounded-full transition-colors duration-200 cursor-pointer shrink-0"
          :class="themeStore.isDark ? 'bg-brand-primary' : 'bg-slate-300'"
          @click="themeStore.toggle()"
          role="switch"
          :aria-checked="themeStore.isDark"
          :title="themeStore.isDark ? t('common.toggleLight') : t('common.toggleDark')"
        >
          <span
            class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200 flex items-center justify-center"
            :class="themeStore.isDark ? 'left-[calc(100%-1.75rem)]' : ''"
          >
            <svg v-if="themeStore.isDark" class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </span>
        </button>
        <button v-permission="'reports.export'" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          {{ t('superAdmin.exportReport') }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <BaseLoading v-if="dash.loading && !dash.hasData" :message="t('common.loading')" />

    <!-- Error state -->
    <div v-else-if="dash.error && !dash.hasData" class="flex flex-col items-center justify-center py-16">
      <span class="material-symbols-outlined text-5xl text-rose-300 dark:text-rose-700 mb-4">error_outline</span>
      <p class="text-sm font-semibold text-rose-600 dark:text-rose-400">{{ dash.error }}</p>
      <button @click="dash.fetchFromApi()" class="mt-4 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20">
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Dashboard content -->
    <template v-else-if="dash.hasData">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="card in dash.cards" :key="card.key" class="group relative">
          <StatisticsCard
            :title="card.title"
            :value="card.value"
            :icon="card.icon"
            :color="card.color"
          />
          <div
            v-if="dash.growthPercentages[card.key] !== undefined"
            class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GrowthBadge :value="dash.growthPercentages[card.key]" />
          </div>
        </div>
      </div>

      <!-- Recent Activity + System Health -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Recent Activity -->
        <div class="lg:col-span-3">
          <RecentActivityCard
            v-if="recentKeys.length > 0"
            :sections="dash.recentActivity"
          />
          <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-10 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">history</span>
            <p class="text-sm font-semibold text-slate-400 dark:text-slate-500">{{ t('common.noData') }}</p>
          </div>
        </div>

        <!-- System Health -->
        <div class="lg:col-span-2">
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl shadow-slate-900/15 p-6 h-full">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-lg text-emerald-400">monitor_heart</span>
              </div>
              <h3 class="text-base font-bold text-white">{{ t('superAdmin.systemHealth') }}</h3>
            </div>
            <div class="space-y-1">
              <div v-for="sys in systemHealth" :key="sys.key" class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">
                <span class="text-sm font-medium text-slate-300">{{ sys.label }}</span>
                <div class="flex items-center gap-2.5">
                  <span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">{{ t('superAdmin.operational') }}</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div v-if="dash.charts.length > 0" class="space-y-8">
        <SectionHeader :title="t('superAdmin.analytics')" :subtitle="t('superAdmin.chartSubtitle')" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard
            v-for="(chart, idx) in dash.charts"
            :key="idx"
            :chart="chart"
          />
        </div>
      </div>
      <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm py-12 text-center">
        <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">monitoring</span>
        <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('superAdmin.chartContainer') }}</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ t('superAdmin.chartSubtitle') }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
