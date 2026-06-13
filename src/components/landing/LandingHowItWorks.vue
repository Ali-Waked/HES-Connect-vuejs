<script setup>
import LandingSection from './LandingSection.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const steps = computed(() => [
  { num: 1, icon: '🔍', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
  { num: 2, icon: '📅', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
  { num: 3, icon: '💬', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
  { num: 4, icon: '💊', title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc') }
]);
</script>

<template>
  <LandingSection class="py-16 lg:py-20 bg-landing-cream">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12 dark:text-white">{{ $t('howItWorks.title') }}</h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        <div class="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-landing-border"></div>

        <div v-for="step in steps" :key="step.num" class="relative text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-brand-primary text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-brand-primary/25 relative z-10">
            {{ step.num }}
          </div>
          <div class="text-3xl mb-3">{{ step.icon }}</div>
          <h3 class="text-base font-bold text-slate-900 mb-2 dark:text-white">{{ step.title }}</h3>
          <p class="text-sm text-slate-500 leading-relaxed max-w-[220px] mx-auto dark:text-slate-400">{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </LandingSection>
</template>
