<template>
  <div class="animate-fade-in space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard icon="medication" :value="totalStock" label="Total Medicines in Stock" tone="brand" />
      <StatsCard icon="inbox" :value="store.pendingRequests.length" label="Pending Requests" tone="amber" />
      <StatsCard icon="warning" :value="store.lowStockItems.length" label="Low Stock Items" tone="red" />
      <StatsCard icon="check_circle" :value="approvedToday" label="Approved Today" tone="green" />
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-48 w-full animate-pulse rounded-xl bg-slate-100"></div>
      <div class="h-48 w-full animate-pulse rounded-xl bg-slate-100"></div>
    </div>

    <template v-else>
      <section class="rounded-xl border border-red-200 bg-red-50/40/20 p-6 shadow-sm">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-red-600">warning</span>
          <h3 class="text-lg font-bold text-slate-900">Low Stock Alert</h3>
        </div>
        <p class="text-sm text-slate-500">Items with quantity below 10</p>
        <div class="mt-4 space-y-3">
          <div v-if="store.lowStockItems.length" v-for="item in store.lowStockItems" :key="item.id" class="flex items-center justify-between rounded-lg bg-white border border-red-100 p-3">
            <div>
              <p class="font-semibold text-slate-900">{{ item.medicineName }}</p>
              <p class="text-xs text-slate-500">Quantity: {{ item.quantity }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">Low Stock</span>
              <button class="rounded-md bg-brand-primary px-3 py-1.5 text-sm text-white" @click="restock(item)">Restock</button>
            </div>
          </div>
          <div v-else class="py-4 text-sm text-slate-500">All items are well-stocked.</div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Recent Medication Requests</h3>
          <p class="text-sm text-slate-500">Last 5 requests</p>
        </div>
        <div class="mt-4">
          <div v-if="recentRequests.length" class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Patient</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Medicines</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Status</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Date</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="req in recentRequests" :key="req.id" class="transition hover:bg-slate-50/70/70">
                  <td class="px-4 py-3 font-semibold text-slate-900">{{ req.patientName }}</td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ req.medicines.length }}</td>
                  <td class="px-4 py-3"><StatusBadge :status="req.status" /></td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ req.date }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2" v-if="req.status === 'pending'">
                      <button class="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white" @click="approve(req)">Approve</button>
                      <button class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700" @click="reject(req)">Reject</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-8 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300">inbox</span>
            <p class="mt-2 text-sm font-bold text-slate-900">No recent requests</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StatsCard from '@/components/staff/shared/StatsCard.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'

const store = useStaffStore()
const loading = ref(true)

const totalStock = computed(() => store.inventory.reduce((s, i) => s + i.quantity, 0))
const approvedToday = computed(() => store.medicationRequests.filter(r => r.status === 'approved').length)
const recentRequests = computed(() => [...store.medicationRequests].slice(0, 5))

function approve(req) { store.approveRequest(req.id); store.showToast('Request approved', 'success') }
function reject(req) { store.rejectRequest(req.id); store.showToast('Request rejected', 'success') }

function restock(item) {
  const qty = prompt('New quantity for ' + item.medicineName + ':', '50')
  if (qty && !isNaN(qty) && Number(qty) >= 0) {
    store.updateInventoryItem(item.id, { quantity: Number(qty) })
    store.showToast('Stock updated', 'success')
  }
}

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
