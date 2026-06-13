<script setup>
import { computed } from 'vue';
import { useScrollReveal } from '../../composables/useScrollReveal';
import { useCountUp } from '../../composables/useCountUp';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  stats: { type: Object, default: null },
  loading: { type: Boolean, default: true }
});

const { t } = useI18n();
const { targetRef, isVisible } = useScrollReveal({ threshold: 0.3 });

const items = computed(() => [
  { key: 'total_users', label: t('stats.users'), icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { key: 'total_facilities', label: t('dashboard.totalFacilities'), icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'total_doctors', label: t('stats.doctors'), icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { key: 'average_rating', label: t('common.status'), icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.951.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
]);

const counters = {};
items.value.forEach(item => {
  counters[item.key] = useCountUp(props.stats?.[item.key] ?? 0, { enabled: isVisible });
});
</script>

<template>
  <section ref="targetRef" class="py-16 lg:py-20 bg-landing-warm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <h2 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{{ $t('stats.activeStories') }}</h2>
        <p class="text-sm text-slate-500 mt-1 dark:text-slate-400">Real-time overview of our healthcare network</p>
      </div>

      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="n in 4" :key="n" class="bg-white rounded-xl border border-landing-border p-6 animate-pulse dark:bg-slate-800">
          <div class="w-11 h-11 rounded-xl bg-slate-100 mb-4 dark:bg-slate-700"></div>
          <div class="h-8 bg-slate-100 rounded w-16 mb-2 dark:bg-slate-700"></div>
          <div class="h-3 bg-slate-100 rounded w-24 dark:bg-slate-700"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="item in items"
          :key="item.key"
          class="bg-white rounded-xl border border-landing-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 dark:bg-slate-800"
        >
          <div class="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon"/>
            </svg>
          </div>
          <p class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ counters[item.key]?.value ?? stats?.[item.key] ?? 0 }}</p>
          <p class="text-sm text-slate-500 mt-1 rtl:text-right dark:text-slate-400">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
