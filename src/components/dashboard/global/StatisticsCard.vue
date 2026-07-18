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
  success: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  warning: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  danger:  'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  info:    'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  neutral: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50',
};
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-xs hover:shadow-sm transition-shadow">
    <!-- Icon -->
    <div
      class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      :class="colorClasses[color] ?? colorClasses.primary"
    >
      <span class="material-symbols-outlined text-[20px]">{{ icon }}</span>
    </div>

    <!-- Text -->
    <div class="min-w-0">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{{ displayTitle }}</p>
      <p class="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{{ displayValue }}</p>
      <p v-if="subtitle" class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
    </div>
  </div>
</template>
