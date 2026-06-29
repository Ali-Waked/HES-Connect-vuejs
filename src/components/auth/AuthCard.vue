<script setup>
defineProps({
  padding: { type: String, default: 'md' },
})
</script>

<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200 dark:border-slate-700"
    :class="[
      padding === 'none' ? '' : padding === 'sm' ? 'p-5 sm:p-6' : padding === 'lg' ? 'p-6 sm:p-8 lg:p-10' : 'p-5 sm:p-6 lg:p-8',
    ]"
  >
    <slot />
  </div>
</template>
