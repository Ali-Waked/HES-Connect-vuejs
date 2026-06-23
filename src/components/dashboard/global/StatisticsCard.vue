<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: true },
  color: { type: String, default: 'primary' },
  subtitle: { type: String, default: '' }
});

const colorClasses = {
  primary: 'text-brand-primary bg-brand-primary/10 dark:text-brand-primary dark:bg-brand-primary/10',
  success: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  warning: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  danger: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30',
  info: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
};
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex gap-4">
    <div class="flex items-start justify-between">
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        :class="colorClasses[color]"
      >
        <span class="material-symbols-outlined text-2xl">{{ icon }}</span>
      </div>
    </div>
    <div class="min-w-0">
      <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ title }}</p>
      <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ value }}</h3>
      <p v-if="subtitle" class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ subtitle }}</p>
    </div>
  </div>
</template>
