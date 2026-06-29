<script setup>
defineProps({
  title: { type: String, default: 'No data available' },
  description: { type: String, default: '' },
  icon: { type: String, default: 'inventory_2' },
  actionLabel: { type: String, default: '' },
  actionTo: { type: [String, Object], default: null },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">
      {{ icon }}
    </span>
    <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md text-center">
      {{ description }}
    </p>
    <router-link
      v-if="actionTo && actionLabel"
      :to="actionTo"
      class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold rounded-xl transition"
    >
      {{ actionLabel }}
    </router-link>
    <slot />
  </div>
</template>
