<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '../../stores/dashboard';
import { useAppointmentsStore } from '../../stores/appointments';
import { useClinicalStore } from '../../stores/clinical';
import { useAccessStore } from '../../stores/access';
import { useTagsStore } from '../../stores/tags';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';

const dashboardStore = useDashboardStore();
const apptStore = useAppointmentsStore();
const clinicalStore = useClinicalStore();
const accessStore = useAccessStore();
const tagsStore = useTagsStore();

// Aggregate Data for Overview
const mainStats = computed(() => [
  { title: 'Total Users', value: dashboardStore.userStats.total, icon: 'group', color: 'primary' },
  { title: 'Total Patients', value: dashboardStore.userStats.patients, icon: 'patient_list', color: 'success' },
  { title: 'Total Doctors', value: dashboardStore.userStats.staff, icon: 'medical_information', color: 'info' },
  { title: 'Total Facilities', value: dashboardStore.facilityCount, icon: 'home_health', color: 'warning' },
  { title: 'Total Appointments', value: apptStore.stats.total, icon: 'calendar_month', color: 'primary' },
  { title: 'Total Prescriptions', value: clinicalStore.clinicalStats.totalPrescriptions, icon: 'description', color: 'info' },
  { title: 'Total Medicines', value: 124, icon: 'medication', color: 'success' },
  { title: 'Total Reviews', value: 342, icon: 'star', color: 'warning' },
  { title: 'Total Articles', value: dashboardStore.articleCount, icon: 'article', color: 'primary' },
  { title: 'Med. Requests', value: clinicalStore.clinicalStats.pendingRequests, icon: 'pending_actions', color: 'danger' }
]);

const recentActivity = computed(() => [
  { type: 'registration', user: 'Khalid Abu Amr', time: '5 mins ago', icon: 'person_add', color: 'text-blue-500 bg-blue-50' },
  { type: 'appointment', user: 'Dr. Ahmed Hassan', detail: 'New booking for general checkup', time: '12 mins ago', icon: 'event_available', color: 'text-emerald-500 bg-emerald-50' },
  { type: 'review', user: 'Mohammed Al-Masri', detail: 'Left a 5-star review for Al-Awda Clinic', time: '45 mins ago', icon: 'star', color: 'text-amber-500 bg-amber-50' },
  { type: 'request', user: 'Rania Saleh', detail: 'Medication request pending approval', time: '1 hour ago', icon: 'medication', color: 'text-rose-500 bg-rose-50' }
]);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Super Admin Console</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Global platform oversight and operational control</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Report
        </button>
        <button class="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          System Action
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
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-primary">bolt</span>
            Recent Activity
          </h3>
          
          <div class="space-y-6">
            <div v-for="(act, idx) in recentActivity" :key="idx" class="flex gap-4 relative">
              <div v-if="idx !== recentActivity.length - 1" class="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-100 dark:bg-slate-700"></div>
              <div :class="`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.color}`">
                <span class="material-symbols-outlined text-xl">{{ act.icon }}</span>
              </div>
              <div class="min-w-0 flex-grow">
                <div class="flex justify-between items-start">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ act.user }}</h4>
                  <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase whitespace-nowrap">{{ act.time }}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ act.detail || 'New user joined the platform' }}</p>
              </div>
            </div>
          </div>

          <button class="w-full mt-8 py-3 text-xs font-black text-slate-400 dark:text-slate-500 hover:text-brand-primary transition uppercase tracking-widest border-t border-slate-50 dark:border-slate-700">
            View Full Audit Log
          </button>
        </div>

        <!-- System Health -->
        <div class="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-900/10">
          <h3 class="text-lg font-bold text-white mb-6">System Health</h3>
          <div class="space-y-4">
            <div v-for="sys in ['API Server', 'Database', 'File Storage', 'Auth Service']" :key="sys" class="flex items-center justify-between">
              <span class="text-sm text-slate-400 dark:text-slate-500 font-medium">{{ sys }}</span>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-emerald-400 uppercase">Operational</span>
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
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Operational Trends</h3>
            <div class="flex gap-2">
              <button class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-md">30D</button>
              <button class="px-3 py-1 text-slate-400 dark:text-slate-500 text-[10px] font-black rounded-md">90D</button>
            </div>
          </div>
          <div class="flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <div class="text-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-500 mb-2">monitoring</span>
              <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chart Visualization Container</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Appointments & User Growth over time</p>
            </div>
          </div>
        </div>

        <!-- Pending Medication Requests -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">High-Priority Medication Requests</h3>
            <span class="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full uppercase">{{ clinicalStore.clinicalStats.pendingRequests }} Pending</span>
          </div>
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-slate-700/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th class="px-6 py-3">Patient</th>
                <th class="px-6 py-3">Facility</th>
                <th class="px-6 py-3">Prescription</th>
                <th class="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700">
              <tr v-for="req in clinicalStore.medicationRequests.filter(r => r.status === 'Pending')" :key="req.id" class="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ req.patient }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-600 dark:text-slate-300">{{ req.facility }}</span>
                </td>
                <td class="px-6 py-4">
                  <code class="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded">{{ req.prescription }}</code>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="clinicalStore.approveRequest(req.id)" class="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">Approve</button>
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
