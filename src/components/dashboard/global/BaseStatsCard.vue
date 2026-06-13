<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: true },
  trend: { type: String, default: '' },
  trendUp: { type: Boolean, default: true },
  color: { type: String, default: 'primary' }
});

const colorClasses = {
  primary: 'text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20',
  success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  danger: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20',
  info: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
};
</script>

<template>
  <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
    <div 
      class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
      :class="colorClasses[color]"
    >
      <slot name="icon">
        <span class="material-symbols-outlined text-2xl">{{ icon }}</span>
      </slot>
    </div>
    <div class="min-w-0">
      <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{{ title }}</p>
      <div class="flex items-baseline gap-2">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white truncate">{{ value }}</h3>
        <span 
          v-if="trend" 
          class="text-xs font-bold flex items-center"
          :class="trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
        >
          <span class="material-symbols-outlined text-sm">{{ trendUp ? 'trending_up' : 'trending_down' }}</span>
          {{ trend }}
        </span>
      </div>
    </div>
  </div>
</template>
