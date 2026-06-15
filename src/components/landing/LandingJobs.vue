<script setup>
import LandingSkeleton from './LandingSkeleton.vue';
import { resolveTranslatedValue } from '@/utils/locale';

defineProps({
  jobs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const typeBadge = {
  hospital: 'bg-danger-light text-danger',
  clinic: 'bg-brand-accent-light text-brand-accent',
  pharmacy: 'bg-success-light text-success',
  medical_point: 'bg-warning-light text-warning'
};

const typeDot = {
  hospital: 'bg-danger',
  clinic: 'bg-brand-accent',
  pharmacy: 'bg-success',
  medical_point: 'bg-warning'
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
  <section class="py-16 lg:py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-10 animate-fade-in-up">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">Latest Job Opportunities</h2>
          <p class="text-slate-500 mt-2">Join leading healthcare facilities across Gaza.</p>
        </div>
        <button class="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition cursor-pointer">
          View All
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="space-y-4">
        <LandingSkeleton variant="row" :count="3" />
      </div>

      <div v-else class="relative">
        <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100"></div>

        <div
          v-for="(job, idx) in jobs"
          :key="job.id"
          class="relative pl-16 pb-8 last:pb-0 animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          <div :class="`absolute left-4 top-1 w-5 h-5 rounded-full border-2 border-white ${typeDot[job.facility_type] || 'bg-slate-400'}`"></div>

          <div class="bg-slate-50 rounded-lg border border-slate-100 p-5 hover:shadow-soft hover:border-slate-200 transition-all duration-300">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h3 class="text-lg font-bold text-slate-900">{{ resolveTranslatedValue(job.title) }}</h3>
              <span :class="`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${typeBadge[job.facility_type] || 'bg-slate-100 text-slate-600'}`">
                {{ job.facility_type?.replace('_', ' ') }}
              </span>
            </div>
            <p class="text-sm text-slate-500 mb-3">{{ resolveTranslatedValue(job.facility_name) }}</p>
            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span class="flex items-center gap-1.5">
                <svg v-if="job.apply_method === 'email'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L5.25 8.566a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                Apply via {{ job.apply_method }}
              </span>
              <span
                class="flex items-center gap-1"
                :class="daysUntil(job.end_date) < 7 ? 'text-warning font-semibold' : ''"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                {{ daysUntil(job.end_date) }} days left
              </span>
            </div>
            <div class="mt-4 flex justify-end">
              <button
                class="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition cursor-pointer"
                @click="apply(job)"
              >Apply Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
