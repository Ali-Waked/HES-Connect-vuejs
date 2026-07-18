<script setup>
import { onMounted, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@/stores/useThemeStore';
import { useDashboardApiStore } from '../../stores/dashboardApi';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import GrowthBadge from '../../components/dashboard/global/GrowthBadge.vue';
import ChartCard from '../../components/dashboard/global/ChartCard.vue';
import BaseLoading from '../../components/dashboard/global/BaseLoading.vue';

const { t, locale } = useI18n();
const themeStore = useThemeStore();
const dash = useDashboardApiStore();

onMounted(() => {
  if (!dash.hasData) {
    dash.fetchFromApi();
  }
});

const systemHealth = [
  { key: 'api', label: t('superAdmin.apiServer'), icon: 'dns' },
  { key: 'db', label: t('superAdmin.database'), icon: 'storage' },
  { key: 'storage', label: t('superAdmin.fileStorage'), icon: 'cloud' },
  { key: 'auth', label: t('superAdmin.authService'), icon: 'lock' },
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

const now = new Date();
const greeting = computed(() => {
  const h = now.getHours();
  if (h < 12) return t('superAdmin.goodMorning', 'Good morning');
  if (h < 17) return t('superAdmin.goodAfternoon', 'Good afternoon');
  return t('superAdmin.goodEvening', 'Good evening');
});

const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Recent Activity helper mappings
const iconMap = {
  users: 'person_add',
  facilities: 'home_health',
  articles: 'article',
  stories: 'circle',
  jobs: 'circle',
  departments: 'circle',
  categories: 'circle',
};

function getIcon(key) {
  return iconMap[key.toLowerCase()] || 'circle';
}

const colorMap = {
  users: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', dot: 'bg-blue-500' },
  facilities: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  articles: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  stories: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', dot: 'bg-purple-500' },
  jobs: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10', dot: 'bg-cyan-500' },
  departments: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', dot: 'bg-indigo-500' },
  categories: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', dot: 'bg-rose-500' },
};

function getColor(key) {
  return colorMap[key.toLowerCase()] || { text: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700/50', dot: 'bg-slate-400' };
}

function extractText(val) {
  if (!val && val !== 0) return '';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) return parsed[locale.value] || parsed.en || parsed.ar || '';
    } catch {}
    return val;
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) return val.map(v => extractText(v)).join(', ');
    if (val.en || val.ar || val[locale.value]) return val[locale.value] || val.en || val.ar || '';
    if (val.name) return extractText(val.name);
    if (val.title) return extractText(val.title);
    return Object.values(val).map(v => extractText(v)).join(' ');
  }
  return '';
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">

    <!-- ── Hero Header Banner ── -->
    <div class="relative overflow-hidden rounded-2xl bg-[#0f172b] p-7 shadow-xl">
      <!-- Decorative grid overlay -->
      <div class="absolute inset-0 hero-grid-pattern opacity-40 pointer-events-none" />
      <!-- Glow orbs -->
      <div class="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-brand-primary/25 blur-3xl pointer-events-none" />
      <div class="absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

      <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <p class="text-sm font-semibold text-teal-300/80 mb-1 tracking-wide uppercase">{{ dateStr }}</p>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {{ greeting }}, Admin 👋
          </h1>
          <p class="text-slate-400 text-sm mt-1.5 font-medium">{{ t('superAdmin.subtitle') }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Theme toggle -->
          <button
            class="relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer shrink-0 shadow-inner"
            :class="themeStore.isDark ? 'bg-brand-primary' : 'bg-slate-600'"
            @click="themeStore.toggle()"
            role="switch"
            :aria-checked="themeStore.isDark"
            :title="themeStore.isDark ? t('common.toggleLight') : t('common.toggleDark')"
          >
            <span
              class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center"
              :class="themeStore.isDark ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'"
            >
              <svg v-if="themeStore.isDark" class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            </span>
          </button>

          <!-- Export button -->
          <button
            v-permission="'reports.export'"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {{ t('superAdmin.exportReport') }}
          </button>

          <!-- Refresh button -->
          <button
            @click="dash.refreshData()"
            :disabled="dash.loading"
            class="inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 text-white rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': dash.loading }">refresh</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Loading ── -->
    <BaseLoading v-if="dash.loading && !dash.hasData" :message="t('common.loading')" />

    <!-- ── Error state ── -->
    <div v-else-if="dash.error && !dash.hasData" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
        <span class="material-symbols-outlined text-3xl text-rose-500">error_outline</span>
      </div>
      <p class="text-sm font-semibold text-rose-600 dark:text-rose-400">{{ dash.error }}</p>
      <button
        @click="dash.fetchFromApi()"
        class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20 cursor-pointer"
      >
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- ── Dashboard Content ── -->
    <template v-else-if="dash.hasData">

      <!-- ── Stat Cards Grid ── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div
          v-for="card in dash.cards"
          :key="card.key"
          class="group relative hover:-translate-y-0.5 transition-transform duration-200"
        >
          <StatisticsCard
            :title="card.title"
            :value="card.value"
            :icon="card.icon"
            :color="card.color"
          />

          <!-- Growth badge (always visible, top-right) -->
          <div
            v-if="dash.growthPercentages[card.key] !== undefined"
            class="absolute top-3 end-3"
          >
            <GrowthBadge :value="dash.growthPercentages[card.key]" />
          </div>
        </div>
      </div>

      <!-- ── Section Divider Label ── -->
      <div class="flex items-center gap-2 pt-2">
        <div class="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-lg text-brand-primary">dashboard</span>
        </div>
        <h2 class="text-base font-black text-slate-900 dark:text-white">{{ t('superAdmin.recentActivity', 'Recent Activity') }} &amp; {{ t('superAdmin.systemHealth') }}</h2>
      </div>

      <!-- ── Divided Layout: Recent Activity Categories + System Health ── -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Recent Activity Cards -->
        <template v-for="sectionKey in recentKeys" :key="sectionKey">
          <div
            v-if="Array.isArray(dash.recentActivity[sectionKey]) && dash.recentActivity[sectionKey].length"
            class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <!-- Section title -->
              <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/50 mb-4">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="getColor(sectionKey).bg">
                  <span class="material-symbols-outlined text-[16px]" :class="getColor(sectionKey).text">
                    {{ getIcon(sectionKey) }}
                  </span>
                </div>
                <h4 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {{ String(sectionKey).replace(/_/g, ' ') }}
                </h4>
                <span class="ms-auto text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {{ dash.recentActivity[sectionKey].length }}
                </span>
              </div>

              <!-- Items List -->
              <div class="space-y-3">
                <div
                  v-for="(item, idx) in dash.recentActivity[sectionKey]"
                  :key="idx"
                  class="flex items-start gap-2.5 py-1 px-1 rounded-lg group/item"
                >
                  <!-- Dot indicator -->
                  <div class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="getColor(sectionKey).dot" />

                  <!-- Content -->
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" :title="extractText(item.title) || extractText(item)">
                      {{ extractText(item.title) || extractText(item) }}
                    </p>
                    <p v-if="extractText(item.description)" class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {{ extractText(item.description) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Time stamp for latest item if available -->
            <div v-if="dash.recentActivity[sectionKey][0] && extractText(dash.recentActivity[sectionKey][0].time)" class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Last update</span>
              <span>{{ extractText(dash.recentActivity[sectionKey][0].time) }}</span>
            </div>
          </div>
        </template>

        <!-- System Health Card -->
        <div class="bg-gradient-to-br from-[#0f172b] to-slate-900 rounded-2xl shadow-xl p-5 flex flex-col justify-between border border-slate-800/80 hover:-translate-y-0.5 transition-transform duration-300">
          <div>
            <div class="flex items-center gap-2.5 pb-4 border-b border-white/5 mb-4">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px] text-emerald-400">monitor_heart</span>
              </div>
              <h4 class="text-xs font-black text-slate-200 uppercase tracking-wider">
                {{ t('superAdmin.systemHealth') }}
              </h4>
              <span class="ms-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow shadow-emerald-500/50" />
            </div>

            <div class="space-y-2">
              <div
                v-for="sys in systemHealth"
                :key="sys.key"
                class="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors group/row cursor-default"
              >
                <div class="w-7 h-7 rounded-lg bg-white/5 group-hover/row:bg-emerald-500/10 flex items-center justify-center transition-colors">
                  <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover/row:text-emerald-400 transition-colors">{{ sys.icon }}</span>
                </div>
                <span class="flex-1 text-xs font-semibold text-slate-350">{{ sys.label }}</span>
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-wide">{{ t('superAdmin.operational') }}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Uptime</span>
            <span class="text-xs font-black text-emerald-400">99.9%</span>
          </div>
        </div>
      </div>

      <!-- ── Analytics Charts ── -->
      <div v-if="dash.charts.length > 0" class="space-y-5">
        <!-- Section header -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-lg text-violet-500">monitoring</span>
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900 dark:text-white">{{ t('superAdmin.analytics') }}</h2>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ t('superAdmin.chartSubtitle') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ChartCard
            v-for="(chart, idx) in dash.charts"
            :key="idx"
            :chart="chart"
          />
        </div>
      </div>

      <!-- Empty charts state -->
      <div v-else class="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 gap-4">
        <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-500">monitoring</span>
        </div>
        <div class="text-center">
          <p class="text-sm font-bold text-slate-500 dark:text-slate-400">{{ t('superAdmin.chartContainer') }}</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ t('superAdmin.chartSubtitle') }}</p>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
