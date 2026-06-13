<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
  }
});

const variantClasses = {
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  primary: 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary',
  success: 'bg-emerald-100/30 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-100/30 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  danger: 'bg-rose-100/30 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
  info: 'bg-blue-100/30 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
};
</script>

<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
    :class="variantClasses[variant]"
  >
    <slot />
  </span>
</template>
