<script setup>
import { useRouter } from 'vue-router';
import LandingSection from './LandingSection.vue';
import LandingSkeleton from './LandingSkeleton.vue';

defineProps({
  facilities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const router = useRouter();

const typeBadge = {
  hospital: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  clinic: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  pharmacy: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  medical_point: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
};


</script>

<template>
  <LandingSection class="py-16 lg:py-20 bg-landing-cream dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Top Rated Facilities</h2>
        <button class="text-sm font-semibold text-brand-primary hover:underline transition cursor-pointer" @click="router.push('/facilities')">View All →</button>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LandingSkeleton variant="card" :count="6" />
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(fac, idx) in facilities"
          :key="fac.id"
          class="bg-white dark:bg-slate-800 rounded-xl border border-landing-border dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/20 transition-all duration-200"
        >
          <div class="h-36 bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 flex items-center justify-center">
            <svg class="w-12 h-12 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
            </svg>
          </div>
          <div class="p-5 space-y-3">
            <span :class="`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${typeBadge[fac.facility_type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`">
              {{ fac.facility_type?.replace('_', ' ') }}
            </span>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">{{ fac.name }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ fac.organization_name }}</p>
            <div class="flex items-center gap-2 text-sm">
              <div class="flex items-center gap-0.5 text-amber-500">
                <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :class="s <= Math.round(fac.rating) ? 'fill-current' : 'text-slate-200 fill-current'" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ fac.rating }}</span>
              <span class="text-slate-400 dark:text-slate-500">({{ fac.review_count }} reviews)</span>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
              Gaza Strip
            </p>
            <button
              class="w-full py-2.5 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary/5 transition cursor-pointer"
              @click="router.push('/facilities')"
            >View Details</button>
          </div>
        </div>
      </div>
    </div>
  </LandingSection>
</template>
