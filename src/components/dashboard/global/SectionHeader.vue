<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
});
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>
