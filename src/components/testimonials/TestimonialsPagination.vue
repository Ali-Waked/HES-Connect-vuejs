<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  lastPage: { type: Number, required: true },
  total: { type: Number, default: 0 },
})

const emit = defineEmits(['update:currentPage'])

const visiblePages = computed(() => {
  const total = props.lastPage
  const current = props.currentPage
  const pages = []
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goTo(page) {
  if (page >= 1 && page <= props.lastPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div v-if="lastPage > 1" class="flex items-center justify-center gap-2 mt-10">
    <button
      :disabled="currentPage <= 1"
      class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
      @click="goTo(currentPage - 1)"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
      </svg>
    </button>

    <template v-for="p in visiblePages" :key="p">
      <button
        class="w-9 h-9 text-sm font-bold rounded-lg border transition cursor-pointer"
        :class="p === currentPage
          ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
        @click="goTo(p)"
      >
        {{ p }}
      </button>
    </template>

    <button
      :disabled="currentPage >= lastPage"
      class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
      @click="goTo(currentPage + 1)"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
      </svg>
    </button>
  </div>
</template>
