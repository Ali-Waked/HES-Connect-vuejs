<script setup>
defineProps({
  columns: { type: Array, required: true },
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false }
});
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
    <div class="w-full overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th 
              v-for="col in columns" 
              :key="col.key"
              class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
              :class="[col.class, col.align === 'right' ? 'text-right' : '']"
              :style="col.width ? { width: col.width } : {}"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <template v-if="loading">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td v-for="col in columns" :key="col.key" class="px-6 py-4.5">
                <div class="h-4 bg-slate-100 rounded-md w-3/4"></div>
              </td>
            </tr>
          </template>
          <template v-else-if="items.length > 0">
            <tr 
              v-for="item in items" 
              :key="item.id || item.uuid"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td 
                v-for="col in columns" 
                :key="col.key"
                class="px-6 py-4.5"
                :class="[col.class, col.align === 'right' ? 'text-right' : '']"
              >
                <slot :name="`cell(${col.key})`" :item="item">
                  <span class="text-sm text-slate-700">{{ item[col.key] }}</span>
                </slot>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="columns.length" class="px-6 py-12 text-center">
              <slot name="empty">
                <div class="flex flex-col items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
                  <p class="text-slate-500 font-medium">No data available</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
