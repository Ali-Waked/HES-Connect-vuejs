<script setup>
import LandingSection from './LandingSection.vue';

const steps = [
  { num: 1, icon: '🔍', title: 'Search', desc: 'Find doctors, facilities, or pharmacies near you across Gaza.' },
  { num: 2, icon: '📅', title: 'Book', desc: 'Schedule an appointment online with your preferred healthcare provider.' },
  { num: 3, icon: '💬', title: 'Consult', desc: 'Chat with your doctor and receive professional medical guidance.' },
  { num: 4, icon: '💊', title: 'Prescribe', desc: 'Receive digital prescriptions and access medications easily.' }
];
</script>

<template>
  <LandingSection class="py-16 lg:py-20 bg-landing-cream">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">How It Works</h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        <div class="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-landing-border"></div>

        <div v-for="step in steps" :key="step.num" class="relative text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-brand-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-brand-primary/25 relative z-10">
            {{ step.num }}
          </div>
          <div class="text-3xl mb-3">{{ step.icon }}</div>
          <h3 class="text-base font-bold text-slate-900 mb-2">{{ step.title }}</h3>
          <p class="text-sm text-slate-500 leading-relaxed max-w-[220px] mx-auto">{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </LandingSection>
</template>
