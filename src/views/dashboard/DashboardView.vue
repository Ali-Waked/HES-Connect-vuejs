<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '../../stores/dashboard';
import { useI18n } from 'vue-i18n';

const store = useDashboardStore();
const { t } = useI18n();

const stats = computed(() => [
  { label: t('nav.about'), value: store.orgCount, icon: 'org', color: 'teal' }, // Use 'about' as organizations
  { label: t('nav.facilities'), value: store.facilityCount, icon: 'fac', color: 'blue' },
  { label: t('nav.pharmacies'), value: store.jobCount, icon: 'job', color: 'orange' }, // Using pharmacies key for jobs or just translate directly
  { label: t('stats.articles'), value: store.articleCount, icon: 'art', color: 'rose' },
]);

// Override labels with more specific ones if possible
stats.value[0].label = t('stats.hospitals'); // Just a fallback for Organizations
stats.value[1].label = t('stats.hospitals'); // Just a fallback for Facilities
stats.value[2].label = t('jobs.title');
stats.value[3].label = t('stats.articles');

</script>

<template>
  <div class="space-y-8 animate-fade-in rtl:text-right">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('dashboard.title') }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ $t('dashboard.welcome', { name: 'Admin' }) }}</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 shadow-xs hover:shadow-md transition-all"
      >
        <!-- Icon bubble -->
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white"
          :class="{
            'bg-teal-500': stat.color === 'teal',
            'bg-blue-500': stat.color === 'blue',
            'bg-purple-500': stat.color === 'purple',
            'bg-orange-500': stat.color === 'orange',
            'bg-rose-500': stat.color === 'rose',
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
        </div>
        <div>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stat.value }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
      <h2 class="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">{{ $t('footer.quickLinks') }}</h2>
      <div class="flex flex-wrap gap-3">
        <router-link to="/platform/organizations" class="inline-flex items-center gap-2 py-2.5 px-4 bg-teal-50/30 dark:bg-teal-500/10 hover:bg-teal-100/50 dark:hover:bg-teal-500/20 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-lg border border-teal-200 dark:border-teal-900/50 transition cursor-pointer">
          {{ $t('stats.hospitals') }} →
        </router-link>
        <router-link to="/platform/facilities" class="inline-flex items-center gap-2 py-2.5 px-4 bg-blue-50/30 dark:bg-blue-500/10 hover:bg-blue-100/50 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-lg border border-blue-200 dark:border-blue-900/50 transition cursor-pointer">
          {{ $t('nav.facilities') }} →
        </router-link>
        <router-link to="/platform/jobs" class="inline-flex items-center gap-2 py-2.5 px-4 bg-orange-50/30 dark:bg-orange-500/10 hover:bg-orange-100/50 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-sm font-semibold rounded-lg border border-orange-200 dark:border-orange-900/50 transition cursor-pointer">
          {{ $t('jobs.title') }} →
        </router-link>
        <router-link to="/platform/articles" class="inline-flex items-center gap-2 py-2.5 px-4 bg-rose-50/30 dark:bg-rose-500/10 hover:bg-rose-100/50 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-sm font-semibold rounded-lg border border-rose-200 dark:border-rose-900/50 transition cursor-pointer">
          {{ $t('stats.articles') }} →
        </router-link>
        <router-link to="/platform/stories" class="inline-flex items-center gap-2 py-2.5 px-4 bg-purple-50/30 dark:bg-purple-500/10 hover:bg-purple-100/50 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-sm font-semibold rounded-lg border border-purple-200 dark:border-purple-900/50 transition cursor-pointer">
          {{ $t('nav.stories') }} →
        </router-link>
        <router-link to="/platform/departments" class="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer">
          {{ $t('departments.title') }} →
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
