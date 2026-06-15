<script setup>
defineProps({
  lines: { type: Number, default: 3 },
  widths: { type: Array, default: () => ['60%', '80%', '40%'] },
  height: { type: String, default: '14px' },
  card: { type: Boolean, default: false },
  avatar: { type: Boolean, default: false },
})
</script>

<template>
  <div :class="card ? 'bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4' : 'space-y-3'">
    <div v-if="avatar" class="flex items-center gap-4">
      <div class="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
      <div class="space-y-2 flex-1">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" style="width:50%" />
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" style="width:30%" />
      </div>
    </div>
    <div v-for="(w, i) in lines" :key="i" class="space-y-2">
      <div
        class="bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"
        :style="{ height, width: widths[i % widths.length] }"
      />
    </div>
  </div>
</template>
