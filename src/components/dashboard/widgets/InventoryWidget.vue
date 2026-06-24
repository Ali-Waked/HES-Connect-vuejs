<template>
  <section class="rounded-xl border border-red-200 bg-red-50/40 p-6 shadow-sm">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-red-600">warning</span>
      <h3 class="text-lg font-bold text-slate-900">Low Stock Alert</h3>
    </div>
    <p class="text-sm text-slate-500">Items with quantity below 10</p>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-14 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-14 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else class="space-y-3">
        <div v-if="store.lowStockItems.length">
          <div v-for="item in store.lowStockItems" :key="item.id" class="flex items-center justify-between rounded-lg bg-white border border-red-100 p-3">
            <div>
              <p class="font-semibold text-slate-900">{{ resolveTranslatedValue(item.medicineName) }}</p>
              <p class="text-xs text-slate-500">Quantity: {{ item.quantity }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">Low Stock</span>
              <button class="rounded-md bg-brand-primary px-3 py-1.5 text-sm text-white" @click="restock(item)">Restock</button>
            </div>
          </div>
        </div>
        <div v-else class="py-4 text-sm text-slate-500">All items are well-stocked.</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

function restock(item) {
  const qty = prompt('New quantity for ' + resolveTranslatedValue(item.medicineName) + ':', '50')
  if (qty && !isNaN(qty) && Number(qty) >= 0) {
    store.updateInventoryItem(item.id, { quantity: Number(qty) })
    store.showToast('Stock updated', 'success')
  }
}
</script>
