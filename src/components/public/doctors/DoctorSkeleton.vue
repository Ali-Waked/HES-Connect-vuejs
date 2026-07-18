<script setup>
defineProps({
  count: { type: Number, default: 8 }
})
</script>

<template>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    <div
      v-for="n in count"
      :key="n"
      class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse"
    >
      <div class="relative h-32 bg-slate-100 dark:bg-slate-700 flex items-end justify-center">
        <div class="w-20 h-20 rounded-full bg-white dark:bg-slate-800 p-1 translate-y-10">
          <div class="w-full h-full rounded-full bg-slate-200 dark:bg-slate-600"></div>
        </div>
      </div>
      <div class="pt-14 px-5 pb-5 text-center space-y-3">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
        <div class="flex justify-center gap-3">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
        <div class="h-6 bg-slate-100 dark:bg-slate-700 rounded-full w-28 mx-auto"></div>
        <div class="h-9 bg-slate-100 dark:bg-slate-700 rounded-xl w-full mt-4"></div>
      </div>
    </div>
  </div>
</template>
