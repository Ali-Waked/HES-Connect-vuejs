<script setup>
import { useRouter } from 'vue-router';
import { useLocaleField } from '@/composables/useLocaleField';

const props = defineProps({
  facilities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const router = useRouter();
const { localField } = useLocaleField();

const typeStyles = {
  hospital: { badge: 'bg-danger', label: 'Hospital' },
  clinic: { badge: 'bg-brand-accent', label: 'Clinic' },
  pharmacy: { badge: 'bg-success', label: 'Pharmacy' },
  medical_point: { badge: 'bg-warning', label: 'Medical Point' }
};
</script>

<template>
  <section class="py-16 lg:py-24 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-12 animate-fade-in-up">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Featured Facilities</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-2">Top-rated healthcare facilities in our network.</p>
        </div>
        <button
          class="btn-ghost shrink-0"
          @click="router.push('/facilities')"
        >
          View All
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
          <div class="h-96 bg-slate-100 dark:bg-slate-800"></div>
        </div>
      </div>

      <div v-else-if="facilities.length === 0" class="text-center py-12 animate-fade-in-up">
        <p class="text-slate-500">No facilities available yet.</p>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div
          v-for="(fac, idx) in facilities.slice(0, 3)"
          :key="fac.id"
          class="group relative rounded-3xl overflow-hidden cursor-pointer h-80 lg:h-96 animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.1}s` }"
          @click="router.push(`/facilities/${fac.id}`)"
        >
          <div v-if="fac.images?.length" class="absolute inset-0">
            <img :src="fac.images[0]" :alt="localField(fac, 'name')" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div v-else :class="`absolute inset-0 bg-gradient-to-br ${typeStyles[fac.facility_type]?.gradient || 'from-slate-400 to-slate-600'}`"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div :class="`absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-semibold text-white ${typeStyles[fac.facility_type]?.badge || 'bg-slate-500'}`">
            {{ typeStyles[fac.facility_type]?.label || fac.facility_type?.replace('_', ' ') }}
          </div>

          <div class="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <span class="text-xs font-bold text-white">{{ fac.rating || '0.0' }}</span>
          </div>

          <div class="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <h3 class="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">{{ localField(fac, 'name') }}</h3>
            <p class="text-sm text-white/70 line-clamp-2 leading-relaxed">{{ localField(fac, 'description') || fac.organization_name || '' }}</p>
            <div class="mt-4 flex items-center gap-2 text-xs text-white/50">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
              Gaza Strip
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
