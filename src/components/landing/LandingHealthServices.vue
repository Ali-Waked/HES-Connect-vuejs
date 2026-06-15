<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  categoryCounts: { type: Object, default: null },
  loading: { type: Boolean, default: true }
});

const router = useRouter();
const { t } = useI18n();

const services = computed(() => [
  {
    type: 'hospital',
    label: t('categories.hospital'),
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    count: props.categoryCounts?.hospitals ?? 0,
    barColor: 'bg-danger',
    pillColor: 'bg-danger-light text-danger'
  },
  {
    type: 'clinic',
    label: t('categories.clinic'),
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    count: props.categoryCounts?.clinics ?? 0,
    barColor: 'bg-brand-accent',
    pillColor: 'bg-brand-accent-light text-brand-accent'
  },
  {
    type: 'pharmacy',
    label: t('categories.pharmacy'),
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    count: props.categoryCounts?.pharmacies ?? 0,
    barColor: 'bg-success',
    pillColor: 'bg-success-light text-success'
  },
  {
    type: 'medical_point',
    label: t('categories.medical_point'),
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    count: props.categoryCounts?.medical_points ?? 0,
    barColor: 'bg-warning',
    pillColor: 'bg-warning-light text-warning'
  }
]);

function goToFacilities(type) {
  router.push(`/facilities?type=${type}`);
}
</script>

<template>
  <section class="py-16 lg:py-20 bg-slate-50 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-10 animate-fade-in-up">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">Browse by Category</h2>
          <p class="text-slate-500 mt-2">Find the right type of care for your needs.</p>
        </div>
        <button
          class="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition cursor-pointer shrink-0"
          @click="router.push('/facilities')"
        >
          View All
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="flex gap-4 overflow-x-auto pb-4">
        <div v-for="n in 4" :key="n" class="shrink-0 w-64 h-40 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
      </div>

      <div v-else class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
        <div
          v-for="(svc, idx) in services"
          :key="svc.type"
          class="snap-start shrink-0 w-72 lg:w-80 bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:-translate-y-1 hover:shadow-soft transition-all duration-300 animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.1}s` }"
          @click="goToFacilities(svc.type)"
        >
          <div class="flex items-start justify-between mb-4">
            <div :class="`w-12 h-12 rounded-lg ${svc.pillColor} flex items-center justify-center`">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" :d="svc.icon"/>
              </svg>
            </div>
            <span :class="`px-2.5 py-0.5 rounded-full text-xs font-semibold ${svc.pillColor}`">
              {{ svc.count }}
            </span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-1">{{ svc.label }}</h3>
          <div class="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div :class="`h-full rounded-full ${svc.barColor}`" :style="{ width: Math.min(100, svc.count * 3) + '%' }"></div>
          </div>
          <p class="text-xs text-slate-400 mt-2">{{ svc.count }} facilities listed</p>
        </div>

        <div class="snap-start shrink-0 w-20 lg:w-24 flex items-center justify-center">
          <button
            class="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:border-brand-primary/30 hover:bg-brand-primary/5 transition cursor-pointer"
            @click="router.push('/facilities')"
          >
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
