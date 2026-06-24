<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Recent Medication Requests</h3>
        <p class="text-sm text-slate-500">Last 5 requests</p>
      </div>
      <button class="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" @click="$router.push('/facility/medication-requests')">View all</button>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else>
        <template v-if="recentRequests.length">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Patient</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Medicines</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Status</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Date</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500" v-if="showActions"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="req in recentRequests" :key="req.id" class="transition hover:bg-slate-50">
                  <td class="px-4 py-3 font-semibold text-slate-900">{{ resolveTranslatedValue(req.patientName) }}</td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ req.medicines.length }}</td>
                  <td class="px-4 py-3"><StatusBadge :status="req.status" /></td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ req.date }}</td>
                  <td class="px-4 py-3" v-if="showActions">
                    <div class="flex gap-2" v-if="req.status === 'pending'">
                      <button class="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white" @click="approve(req)">Approve</button>
                      <button class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700" @click="reject(req)">Reject</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <div v-else class="py-8 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300">inbox</span>
          <p class="mt-2 text-sm font-bold text-slate-900">No recent requests</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  showActions: { type: Boolean, default: false }
})

const store = useStaffStore()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

const recentRequests = computed(() => [...store.medicationRequests].slice(0, 5))

function approve(req) { store.approveRequest(req.id); store.showToast('Request approved', 'success') }
function reject(req) { store.rejectRequest(req.id); store.showToast('Request rejected', 'success') }
</script>
