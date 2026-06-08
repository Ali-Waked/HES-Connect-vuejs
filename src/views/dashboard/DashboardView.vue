<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '../../stores/dashboard';

const store = useDashboardStore();
const stats = computed(() => [
  { label: 'Organizations', value: store.orgCount, icon: 'org', color: 'teal' },
  { label: 'Facilities', value: store.facilityCount, icon: 'fac', color: 'blue' },
  { label: 'Jobs', value: store.jobCount, icon: 'job', color: 'orange' },
  { label: 'Articles', value: store.articleCount, icon: 'art', color: 'rose' },
]);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back — Health Ecosystem overview</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow"
      >
        <!-- Icon bubble -->
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white"
          :class="{
            'bg-teal-500': stat.color === 'teal',
            'bg-blue-500': stat.color === 'blue',
            'bg-purple-500': stat.color === 'purple',
            'bg-orange-500': stat.color === 'orange',
          }"
        >
          <!-- org icon -->
          <svg v-if="stat.icon === 'org'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <!-- fac icon -->
          <svg v-else-if="stat.icon === 'fac'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
          </svg>
          <!-- job icon -->
          <svg v-else-if="stat.icon === 'job'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504-1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504-1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" />
          </svg>
          <!-- art icon -->
          <svg v-else-if="stat.icon === 'art'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <!-- sto icon -->
          <svg v-else-if="stat.icon === 'sto'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <!-- dep icon -->
          <svg v-else-if="stat.icon === 'dep'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <!-- usr icon -->
          <svg v-else class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stat.value }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
      <h2 class="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Quick Access</h2>
      <div class="flex flex-wrap gap-3">
        <router-link to="/admin/organizations" class="inline-flex items-center gap-2 py-2.5 px-4 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-sm font-semibold rounded-lg border border-teal-200 dark:border-teal-800 transition cursor-pointer">
          Organizations →
        </router-link>
        <router-link to="/admin/facilities" class="inline-flex items-center gap-2 py-2.5 px-4 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-lg border border-blue-200 dark:border-blue-800 transition cursor-pointer">
          Facilities →
        </router-link>
        <router-link to="/admin/jobs" class="inline-flex items-center gap-2 py-2.5 px-4 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-sm font-semibold rounded-lg border border-orange-200 dark:border-orange-800 transition cursor-pointer">
          Jobs →
        </router-link>
        <router-link to="/admin/articles" class="inline-flex items-center gap-2 py-2.5 px-4 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-sm font-semibold rounded-lg border border-rose-200 dark:border-rose-800 transition cursor-pointer">
          Articles →
        </router-link>
        <router-link to="/admin/stories" class="inline-flex items-center gap-2 py-2.5 px-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-lg border border-purple-200 dark:border-purple-800 transition cursor-pointer">
          Stories →
        </router-link>
        <router-link to="/admin/departments" class="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 transition cursor-pointer">
          Departments →
        </router-link>
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
