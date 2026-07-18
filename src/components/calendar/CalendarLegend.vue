<script setup>
const props = defineProps({
  facilities: { type: Array, default: () => [] },
})

const facilityColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

function getColor(index) {
  return facilityColors[index % facilityColors.length]
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
    <template v-for="(f, i) in facilities" :key="f.uuid">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm" :style="{ backgroundColor: getColor(i) }"></span>
        <span class="text-slate-600 dark:text-slate-400">{{ f.name }}</span>
      </div>
    </template>
    <div class="flex items-center gap-1.5">
      <span class="w-3 h-3 rounded-sm bg-red-500"></span>
      <span class="text-slate-600 dark:text-slate-400">Approved Unavailable</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-3 h-3 rounded-sm bg-yellow-400"></span>
      <span class="text-slate-600 dark:text-slate-400">Pending</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-3 h-3 rounded-sm bg-slate-400"></span>
      <span class="text-slate-600 dark:text-slate-400">Rejected</span>
    </div>
  </div>
</template>
