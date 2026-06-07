<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
  }
});

const variantClasses = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-brand-primary/10 text-brand-primary',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-blue-100 text-blue-700'
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
