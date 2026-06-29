<script setup>
defineProps({
  columns: { type: Array, required: true },
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'No records found' },
  emptyDescription: { type: String, default: 'Try changing filters or adding new data.' }
});
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-5 py-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <template v-if="loading">
            <tr v-for="row in 5" :key="row">
              <td v-for="column in columns" :key="column.key" class="px-5 py-4">
                <div class="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-700"></div>
              </td>
            </tr>
          </template>
          <template v-else-if="items.length">
            <tr v-for="item in items" :key="item.id" class="transition hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td v-for="column in columns" :key="column.key" class="px-5 py-4 align-middle">
                <slot :name="`cell-${column.key}`" :item="item">
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ item[column.key] }}</span>
                </slot>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="columns.length" class="px-5 py-12 text-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">inventory_2</span>
              <h3 class="mt-2 text-sm font-bold text-slate-900 dark:text-white">{{ emptyTitle }}</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ emptyDescription }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
