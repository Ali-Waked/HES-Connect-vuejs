<script setup>
const props = defineProps({
  facilities: { type: Array, default: () => [] },
  selectedFacility: { type: Object, default: null },
  weekLabel: { type: String, default: '' },
})

const emit = defineEmits(['update:selectedFacility', 'prevWeek', 'nextWeek', 'today'])
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
    <!-- Facility selector -->
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-slate-400 text-[18px]">business</span>
      <select
        class="py-2 px-3 pr-8 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_8px_center] bg-[length:16px] transition min-w-[180px]"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="selectedFacility?.uuid || ''"
        @change="emit('update:selectedFacility', $event.target.value || null)"
      >
        <option value="">All Facilities</option>
        <option v-for="f in facilities" :key="f.uuid" :value="f.uuid">{{ f.name }}</option>
      </select>
    </div>

    <!-- Navigation -->
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        @click="emit('today')"
      >
        Today
      </button>
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
          @click="emit('prevWeek')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[180px] text-center px-2">
          {{ weekLabel }}
        </span>
        <button
          class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
          @click="emit('nextWeek')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
