<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  backTo: { type: [String, Object], default: null },
})
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
    <div class="flex items-center gap-3">
      <router-link
        v-if="backTo"
        :to="backTo"
        class="flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </router-link>
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
