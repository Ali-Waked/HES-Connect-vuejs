<script setup>
defineProps({
  filterActive: { type: Boolean, default: false },
})

defineEmits(['create'])
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div class="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6">
      <svg v-if="filterActive" class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      <svg v-else class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
    </div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
      {{ filterActive ? 'No schedules found' : 'No schedules yet' }}
    </h3>
    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
      {{ filterActive ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Create your first staff schedule to start accepting appointments.' }}
    </p>
    <slot />
  </div>
</template>
