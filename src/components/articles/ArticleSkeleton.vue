<script setup>
defineProps({
  variant: { type: String, default: 'card' },
  count: { type: Number, default: 3 }
})
</script>

<template>
  <div v-if="variant === 'hero'" class="card-base overflow-hidden animate-pulse">
    <div class="aspect-[21/9] bg-slate-200 dark:bg-slate-700"></div>
    <div class="p-6 lg:p-8 space-y-3">
      <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
      <div class="h-7 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
    </div>
  </div>

  <div v-else-if="variant === 'card-grid'" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="n in count" :key="n" class="card-base overflow-hidden animate-pulse">
      <div class="aspect-[16/9] bg-slate-200 dark:bg-slate-700"></div>
      <div class="p-5 space-y-3">
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div class="flex gap-4 pt-2">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="variant === 'sidebar'" class="space-y-4">
    <div v-for="n in count" :key="n" class="flex gap-3 animate-pulse">
      <div class="w-20 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0"></div>
      <div class="flex-1 space-y-2 pt-1">
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      </div>
    </div>
  </div>

  <div v-else class="card-base p-5 animate-pulse">
    <div class="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
    <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
  </div>
</template>
