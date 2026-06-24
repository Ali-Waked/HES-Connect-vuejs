<script setup>
defineProps({
  count: { type: Number, default: 6 }
})
</script>

<template>
  <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div
      v-for="n in count"
      :key="n"
      class="card-base overflow-hidden animate-pulse"
    >
      <div class="p-5 space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
        </div>
        <div class="flex gap-2">
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
        <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-full"></div>
      </div>
    </div>
  </div>
</template>
