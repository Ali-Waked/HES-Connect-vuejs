<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const props = defineProps({
  title: { type: [String, Object], required: true },
  value: { type: [String, Number, Object], required: true },
  icon: { type: String, required: true },
  color: { type: String, default: 'primary' },
  subtitle: { type: String, default: '' }
});

function extractText(val) {
  if (!val && val !== 0) return '';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object') return parsed[locale.value] || parsed.en || parsed.ar || '';
    } catch {}
    return val;
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return val[locale.value] || val.en || val.ar || '';
  return '';
}

const displayValue = computed(() => extractText(props.value));
const displayTitle = computed(() => extractText(props.title));

const colorClasses = {
  primary: 'text-brand-primary bg-brand-primary/10 dark:text-brand-primary dark:bg-brand-primary/10',
  success: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  warning: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  danger: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30',
  info: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  neutral: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50',
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
      <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ displayTitle }}</p>
      <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ displayValue }}</h3>
      <p v-if="subtitle" class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ subtitle }}</p>
    </div>
  </div>
</template>
