<script setup>
import LandingSection from './LandingSection.vue';
import { resolveTranslatedValue } from '@/utils/locale';

defineProps({
  announcements: { type: Array, default: () => [] }
});
</script>

<template>
  <LandingSection v-if="announcements.length > 0" class="py-6 bg-warning-light/40 border-y border-warning/10 dark:bg-warning/10 dark:border-warning/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        v-for="item in announcements"
        :key="item.id"
        class="flex items-start gap-4"
      >
        <div class="w-10 h-10 shrink-0 bg-warning-light rounded-xl flex items-center justify-center text-warning dark:bg-warning/20 dark:text-warning-light">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M10.34 15.84h3.32M12 3v3m0 12v3M3.34 8.34l2.12 2.12m11.08 0l2.12-2.12M3.34 15.66l2.12-2.12m11.08 0l2.12 2.12M21 12h-3M6 12H3"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(item.title) }}</h3>
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ item.date }}</span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400">{{ item.content }}</p>
        </div>
      </div>
    </div>
  </LandingSection>
</template>
