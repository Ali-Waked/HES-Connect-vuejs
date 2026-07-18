<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
})

const emit = defineEmits(['update:searchQuery', 'update:statusFilter', 'clear'])

function onSearch(e) {
  emit('update:searchQuery', e.target.value)
}

function onStatusChange(e) {
  emit('update:statusFilter', e.target.value)
}

function clear() {
  emit('clear')
}
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
    <div class="flex flex-1 flex-wrap items-center gap-3">
      <div class="relative w-full sm:w-64">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="text"
          placeholder="Search staff..."
          :value="searchQuery"
          @input="onSearch"
          class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
        />
      </div>
      <select
        :value="statusFilter"
        @change="onStatusChange"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 min-w-[140px] transition"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button
        v-if="searchQuery || statusFilter"
        class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition underline underline-offset-2"
        @click="clear"
      >
        Clear filters
      </button>
    </div>
    <slot name="actions" />
  </div>
</template>
