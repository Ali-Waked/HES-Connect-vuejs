<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  overview: { type: Object, default: null },
  loading: { type: Boolean, default: true }
});

const router = useRouter();

const stats = [
  { value: props.overview?.total_users ?? '10K+', label: 'Patients Served', color: 'bg-brand-primary/10' },
  { value: props.overview?.appointments_completed ?? '5K+', label: 'Appointments', color: 'bg-brand-accent/10' },
  { value: props.overview?.articles_published ?? '200+', label: 'Articles', color: 'bg-brand-warm/10' },
  { value: props.overview?.active_stories ?? '50+', label: 'Active Stories', color: 'bg-success/10' }
];
</script>

<template>
  <section class="py-16 lg:py-24 bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
        <div class="lg:col-span-3 space-y-6 animate-fade-in-up">
          <span class="eyebrow-badge">
            About Us
          </span>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Our Mission: Better Healthcare for Gaza
          </h2>
          <p class="text-slate-500 leading-relaxed text-lg">
            We are dedicated to transforming healthcare access across the Gaza Strip. Our platform connects patients with verified healthcare providers, making it easier than ever to find the care you need.
          </p>
          <p class="text-slate-400 leading-relaxed">
            Founded with a vision to bridge the gap between patients and quality healthcare, we have grown into a trusted network serving thousands across the region.
          </p>
          <button
            class="btn-primary"
            @click="router.push('/about')"
          >
            Learn More About Us
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </button>
        </div>

        <div class="lg:col-span-2 animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(stat, idx) in stats"
              :key="idx"
              class="rounded-2xl border border-slate-100 p-5 lg:p-6 text-center hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300"
            >
              <p class="text-2xl lg:text-3xl font-extrabold text-slate-900">{{ stat.value }}</p>
              <p class="text-xs text-slate-400 font-medium mt-1">{{ stat.label }}</p>
              <div class="w-full h-1 rounded-full bg-slate-50 mt-3 overflow-hidden">
                <div :class="`h-full rounded-full w-2/3 ${stat.color.split(' ')[0]}`"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
