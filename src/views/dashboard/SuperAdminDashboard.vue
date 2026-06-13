<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@/stores/useThemeStore';
import { useDashboardStore } from '../../stores/dashboard';
import { useAppointmentsStore } from '../../stores/appointments';
import { useClinicalStore } from '../../stores/clinical';
import { useAccessStore } from '../../stores/access';
import { useTagsStore } from '../../stores/tags';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';

const { t } = useI18n();
const themeStore = useThemeStore();
const dashboardStore = useDashboardStore();
const apptStore = useAppointmentsStore();
const clinicalStore = useClinicalStore();
const accessStore = useAccessStore();
const tagsStore = useTagsStore();

// Aggregate Data for Overview
const mainStats = computed(() => [
  { title: t('superAdmin.totalUsers'), value: dashboardStore.userStats.total, icon: 'group', color: 'primary' },
  { title: t('superAdmin.totalPatients'), value: dashboardStore.userStats.patients, icon: 'patient_list', color: 'success' },
  { title: t('superAdmin.totalDoctors'), value: dashboardStore.userStats.staff, icon: 'medical_information', color: 'info' },
  { title: t('superAdmin.totalFacilities'), value: dashboardStore.facilityCount, icon: 'home_health', color: 'warning' },
  { title: t('superAdmin.totalAppointments'), value: apptStore.stats.total, icon: 'calendar_month', color: 'primary' },
  { title: t('superAdmin.totalPrescriptions'), value: clinicalStore.clinicalStats.totalPrescriptions, icon: 'description', color: 'info' },
  { title: t('superAdmin.totalMedications'), value: 124, icon: 'medication', color: 'success' },
  { title: t('superAdmin.totalReviews'), value: 342, icon: 'star', color: 'warning' },
  { title: t('superAdmin.totalArticles'), value: dashboardStore.articleCount, icon: 'article', color: 'primary' },
  { title: t('superAdmin.medicationRequests'), value: clinicalStore.clinicalStats.pendingRequests, icon: 'pending_actions', color: 'danger' }
]);

const systems = computed(() => [
  { key: 'api', label: t('superAdmin.apiServer') },
  { key: 'db', label: t('superAdmin.database') },
  { key: 'storage', label: t('superAdmin.fileStorage') },
  { key: 'auth', label: t('superAdmin.authService') },
]);

const recentActivity = computed(() => [
  { type: 'registration', user: 'Khalid Abu Amr', time: '5 mins ago', icon: 'person_add', color: 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' },
  { type: 'appointment', user: 'Dr. Ahmed Hassan', detail: 'New booking for general checkup', time: '12 mins ago', icon: 'event_available', color: 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' },
  { type: 'review', user: 'Mohammed Al-Masri', detail: 'Left a 5-star review for Al-Awda Clinic', time: '45 mins ago', icon: 'star', color: 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30' },
  { type: 'request', user: 'Rania Saleh', detail: 'Medication request pending approval', time: '1 hour ago', icon: 'medication', color: 'text-rose-500 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30' }
]);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('superAdmin.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ t('superAdmin.subtitle') }}</p>
      </div>
      <div class="flex gap-3 items-center">
        <button
          class="relative w-14 h-7 rounded-full transition-colors duration-200 cursor-pointer"
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
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          {{ t('superAdmin.exportReport') }}
        </button>
        <button class="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ t('superAdmin.systemAction') }}
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatisticsCard 
        v-for="stat in mainStats" 
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- Activity Feed -->
      <div class="xl:col-span-1 space-y-6">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-primary">bolt</span>
            {{ t('superAdmin.recentActivity') }}
          </h3>
          
          <div class="space-y-6">
            <div v-for="(act, idx) in recentActivity" :key="idx" class="flex gap-4 relative">
              <div v-if="idx !== recentActivity.length - 1" class="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-100 dark:bg-slate-700"></div>
              <div :class="`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.color}`">
                <span class="material-symbols-outlined text-xl">{{ act.icon }}</span>
              </div>
              <div class="min-w-0 flex-grow">
                <div class="flex justify-between items-start">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ act.user }}</h4>
                  <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase whitespace-nowrap">{{ act.time }}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ act.detail || t('superAdmin.newUserActivity') }}</p>
              </div>
            </div>
          </div>

          <button class="w-full mt-8 py-3 text-xs font-black text-slate-400 dark:text-slate-500 hover:text-brand-primary transition uppercase tracking-widest border-t border-slate-50 dark:border-slate-700">
            {{ t('superAdmin.viewFullAuditLog') }}
          </button>
        </div>

        <!-- System Health -->
        <div class="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-900/10">
          <h3 class="text-lg font-bold text-white mb-6">{{ t('superAdmin.systemHealth') }}</h3>
          <div class="space-y-4">
            <div v-for="sys in systems" :key="sys.key" class="flex items-center justify-between">
              <span class="text-sm text-slate-400 font-medium">{{ sys.label }}</span>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-emerald-400 uppercase">{{ t('superAdmin.operational') }}</span>
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Placeholder -->
      <div class="xl:col-span-2 space-y-8">
        <!-- Monthly Trends Placeholder -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-[400px] flex flex-col">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('superAdmin.operationalTrends') }}</h3>
            <div class="flex gap-2">
              <button class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-md">{{ t('superAdmin.period30d') }}</button>
              <button class="px-3 py-1 text-slate-400 dark:text-slate-500 text-[10px] font-black rounded-md">{{ t('superAdmin.period90d') }}</button>
            </div>
          </div>
          <div class="flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
            <div class="text-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">monitoring</span>
              <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('superAdmin.chartContainer') }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ t('superAdmin.chartSubtitle') }}</p>
            </div>
          </div>
        </div>

        <!-- Pending Medication Requests -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('superAdmin.highPriorityRequests') }}</h3>
            <span class="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-full uppercase">{{ clinicalStore.clinicalStats.pendingRequests }} {{ t('superAdmin.pending') }}</span>
          </div>
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th class="px-6 py-3">{{ t('superAdmin.patient') }}</th>
                <th class="px-6 py-3">{{ t('superAdmin.facility') }}</th>
                <th class="px-6 py-3">{{ t('pageTitles.prescriptions') }}</th>
                <th class="px-6 py-3 text-right">{{ t('superAdmin.action') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700">
              <tr v-for="req in clinicalStore.medicationRequests.filter(r => r.status === 'Pending')" :key="req.id" class="hover:bg-slate-50/30/30 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ req.patient }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-600 dark:text-slate-300">{{ req.facility }}</span>
                </td>
                <td class="px-6 py-4">
                  <code class="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 px-2 py-0.5 rounded">{{ req.prescription }}</code>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="clinicalStore.approveRequest(req.id)" class="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 uppercase tracking-widest">{{ t('superAdmin.approve') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
