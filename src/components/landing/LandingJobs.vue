<script setup>
import LandingSection from './LandingSection.vue';
import LandingSkeleton from './LandingSkeleton.vue';

defineProps({
  jobs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const typeBadge = {
  hospital: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  clinic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pharmacy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medical_point: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
};

function daysUntil(endDate) {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function apply(job) {
  if (job.apply_method === 'email') {
    window.location.href = `mailto:${job.apply_value}`;
  } else {
    window.open(job.apply_value, '_blank');
  }
}
</script>

<template>
  <LandingSection class="py-16 lg:py-20 bg-landing-warm dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Latest Job Opportunities</h2>
        <button class="text-sm font-semibold text-brand-primary hover:underline cursor-pointer">View All →</button>
      </div>

      <div v-if="loading" class="space-y-4">
        <LandingSkeleton variant="row" :count="3" />
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="bg-landing-cream dark:bg-slate-900 rounded-xl border border-landing-border dark:border-slate-700 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ job.facility_name }}</span>
              <span :class="`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${typeBadge[job.facility_type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`">
                {{ job.facility_type?.replace('_', ' ') }}
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ job.title }}</h3>
            <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1.5">
                <svg v-if="job.apply_method === 'email'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L5.25 8.566a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                Apply via {{ job.apply_method }}
              </span>
              <span
                class="flex items-center gap-1"
                :class="daysUntil(job.end_date) < 7 ? 'text-amber-600 font-semibold' : ''"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                Ends {{ job.end_date }}
                <span v-if="daysUntil(job.end_date) < 7" class="text-xs">(expiring soon)</span>
              </span>
            </div>
          </div>
          <button
            class="shrink-0 px-5 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition cursor-pointer"
            @click="apply(job)"
          >Apply Now</button>
        </div>
      </div>
    </div>
  </LandingSection>
</template>
