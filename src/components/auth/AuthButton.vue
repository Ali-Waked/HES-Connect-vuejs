<script setup>
defineProps({
  type: { type: String, default: 'submit' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'primary' },
  fullWidth: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    :class="[
      fullWidth ? 'w-full' : '',
      size === 'sm' ? 'px-4 py-2 text-sm' : size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-5 py-3 text-sm',
      variant === 'primary'
        ? 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/30 focus:ring-brand-primary/40 active:bg-brand-primary-dark'
        : variant === 'secondary'
        ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-300'
        : variant === 'ghost'
        ? 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300'
        : '',
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ms-1 me-2 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>
