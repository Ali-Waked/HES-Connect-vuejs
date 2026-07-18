<script setup>
defineProps({
  count: { type: Number, default: 3 },
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    <div v-for="i in count" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 space-y-4 animate-pulse">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700" />
        <div class="space-y-2 flex-1">
          <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/5" />
          <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/5" />
        </div>
      </div>
      <div class="space-y-2.5">
        <div v-for="j in 4" :key="j" class="flex items-center gap-3">
          <div class="h-5 w-24 bg-slate-100 dark:bg-slate-700 rounded-md" />
          <div class="h-4 flex-1 bg-slate-100 dark:bg-slate-700 rounded" />
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
        <div class="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
        <div class="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  </div>
</template>
