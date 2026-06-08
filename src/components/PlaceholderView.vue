<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '../stores/dashboard';

const props = defineProps({
  tab: { type: String, required: true }
});

const store = useDashboardStore();

const title = computed(() => {
  if (!props.tab) return '';
  return props.tab.charAt(0).toUpperCase() + props.tab.slice(1);
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{{ title }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Manage, view, and analyze your {{ title.toLowerCase() }} data.</p>
      </div>
    </div>

    <!-- Dashboard Metric Grid (Shown only on Dashboard) -->
    <div v-if="tab === 'dashboard'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Orgs Card -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition duration-200">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 text-brand-primary">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{{ store.orgCount }}</span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Organizations</span>
        </div>
      </div>

      <!-- Facilities Card -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition duration-200">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 10.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9.5M12 4a4 4 0 0 1 4 4v2.5H8V8a4 4 0 0 1 4-4z" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{{ store.facilityCount }}</span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Facilities</span>
        </div>
      </div>

      <!-- Departments Card -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition duration-200">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">12</span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Departments</span>
        </div>
      </div>

      <!-- Users Card -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition duration-200">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">84</span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Users</span>
        </div>
      </div>
    </div>

    <!-- General Placeholder Panel -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-12 text-center flex justify-center items-center">
      <div class="max-w-[420px] flex flex-col items-center gap-4">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ title }} Module</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          This section is currently under active development. You can view, add, and manage data from the fully functional 
          <strong class="text-brand-primary cursor-pointer hover:underline" @click="store.setActiveTab('organizations')">Organizations</strong> 
          and 
          <strong class="text-brand-primary cursor-pointer hover:underline" @click="store.setActiveTab('facilities')">Facilities</strong> pages.
        </p>
        <button 
          class="mt-2 inline-flex items-center justify-center py-2 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer" 
          @click="store.setActiveTab('organizations')"
        >
          Go to Organizations
        </button>
      </div>
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
