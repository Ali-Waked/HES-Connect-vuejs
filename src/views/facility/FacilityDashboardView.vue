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
import RecentActivityCard from '@/components/dashboard/global/RecentActivityCard.vue';
import BaseLoading from '@/components/dashboard/global/BaseLoading.vue';
import { useAuthPermissions } from '@/composables/useAuthPermissions';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const staffStore = useStaffStore();
const dash = useFacilityDashboardStore();
const { can } = useAuthPermissions();

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

const quickLinks = computed(() => [
  { label: t('staffSidebar.appointments'), icon: 'calendar_month', to: '/dashboard/appointments', permission: 'view_appointments' },
  { label: t('staffSidebar.myPatients'), icon: 'group', to: '/dashboard/patients', permission: 'view_patients' },
  { label: t('staffSidebar.prescriptions'), icon: 'description', to: '/dashboard/prescriptions', permission: 'view_prescriptions' },
  { label: t('staffSidebar.mySchedule'), icon: 'schedule', to: '/dashboard/schedule', permission: 'view_staff_schedules' },
  { label: t('departments.title'), icon: 'domain', to: '/dashboard/departments', permission: 'view_departments' },
  { label: t('staffSidebar.reports'), icon: 'bar_chart', to: '/dashboard/reports', permission: 'view_reports' },
]);

const recentKeys = computed(() => dash.hasData ? Object.keys(dash.recentData) : []);

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
          v-for="(card, idx) in dash.cards"
          :key="idx"
          class="relative"
        >
          <StatisticsCard
            :title="card.title"
            :value="card.value"
            :icon="card.icon || 'bar_chart'"
            :color="card.color || 'primary'"
            :subtitle="card.subtitle"
          />
          <div
            v-if="dash.growthPercentages[card.key || card.title] !== undefined"
            class="absolute top-3 right-3"
          >
            <GrowthBadge :value="dash.growthPercentages[card.key || card.title]" />
          </div>
        </div>
      </div>

      <!-- Charts + Recent Data -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Charts -->
        <div class="xl:col-span-2 space-y-6">
          <template v-if="dash.charts.length > 0">
            <ChartCard
              v-for="(chart, idx) in dash.charts"
              :key="idx"
              :chart="chart"
            />
          </template>
          <div
            v-else
            class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-[300px] flex items-center justify-center"
          >
            <div class="text-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">monitoring</span>
              <p class="text-sm font-bold text-slate-400 dark:text-slate-500">Chart Data</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Analytics charts will appear here</p>
            </div>
          </div>
        </div>

        <!-- Recent Data Sidebar -->
        <div class="space-y-6">
          <RecentActivityCard
            v-if="recentKeys.length > 0"
            :sections="dash.recentData"
          />
          <div
            v-else
            class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-center"
          >
            <span class="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">history</span>
            <p class="text-sm font-bold text-slate-400 dark:text-slate-500">No recent activity</p>
          </div>
        </div>
      </div>

      <!-- Quick Shortcuts -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Shortcuts</h3>
        <div class="flex flex-wrap gap-3">
          <router-link
            v-for="link in quickLinks"
            :key="link.to"
            v-permission="link.permission"
            :to="link.to"
            class="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition border border-slate-100 dark:border-slate-700"
          >
            <span class="material-symbols-outlined text-lg text-brand-primary">{{ link.icon }}</span>
            {{ link.label }}
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
