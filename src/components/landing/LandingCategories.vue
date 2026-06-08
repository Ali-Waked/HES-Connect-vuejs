<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import LandingSection from './LandingSection.vue';
import LandingSkeleton from './LandingSkeleton.vue';

const props = defineProps({
  counts: { type: Object, default: null },
  loading: { type: Boolean, default: true }
});

const router = useRouter();

const categories = computed(() => [
  { type: 'hospital', label: 'Hospitals', count: props.counts?.hospital ?? 0, desc: 'Full-service hospitals', iconBg: 'bg-red-50', iconColor: 'text-red-500', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { type: 'clinic', label: 'Clinics', count: props.counts?.clinic ?? 0, desc: 'Outpatient clinics', iconBg: 'bg-blue-50', iconColor: 'text-blue-500', icon: 'M19 10.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9.5M12 4a4 4 0 0 1 4 4v2.5H8V8a4 4 0 0 1 4-4z' },
  { type: 'medical_point', label: 'Medical Points', count: props.counts?.medical_point ?? 0, desc: 'Emergency medical points', iconBg: 'bg-orange-50', iconColor: 'text-orange-500', icon: 'M12 4.5v15m7.5-7.5h-15' },
  { type: 'pharmacy', label: 'Pharmacies', count: props.counts?.pharmacy ?? 0, desc: 'Medication & supplies', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5' }
]);
</script>

<template>
  <LandingSection id="categories" class="py-16 lg:py-20 bg-landing-warm dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Explore by Category</h2>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LandingSkeleton variant="card" :count="4" />
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="cat in categories"
          :key="cat.type"
          class="group bg-landing-cream dark:bg-slate-900 rounded-xl border border-landing-border dark:border-slate-700 p-6 text-left hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/30 transition-all duration-200 cursor-pointer"
          @click="router.push({ path: '/facilities', query: { type: cat.type } })"
        >
          <div :class="`w-12 h-12 rounded-xl ${cat.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`">
            <svg :class="`w-6 h-6 ${cat.iconColor}`" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
              <path stroke-linecap="round" stroke-linejoin="round" :d="cat.icon"/>
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{{ cat.label }}</h3>
          <p class="text-2xl font-extrabold text-brand-primary mb-1">{{ cat.count }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ cat.desc }}</p>
        </button>
      </div>
    </div>
  </LandingSection>
</template>
