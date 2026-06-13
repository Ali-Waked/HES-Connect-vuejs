<template>
  <StaffModalShell :show="show" :title="'Request: ' + (request?.patientName || '')" width="max-w-lg" @close="$emit('close')">
    <div v-if="request" class="space-y-4">
      <div class="flex items-center gap-3">
        <AvatarInitial :name="request.patientName" />
        <div>
          <p class="font-bold text-slate-900">{{ request.patientName }}</p>
          <p class="text-sm text-slate-500">{{ request.date }}</p>
        </div>
      </div>
      <div class="space-y-2">
        <h4 class="font-bold text-slate-900">Prescribed Medicines</h4>
        <div v-for="med in request.medicines" :key="med.name" class="rounded-lg border border-slate-100 p-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold">{{ med.name }}</p>
              <p class="text-xs text-slate-500">{{ med.dosage }} — {{ med.duration }}</p>
            </div>
            <span class="text-xs font-semibold" :class="stockLevel(med.name).color">{{ stockLevel(med.name).text }}</span>
          </div>
        </div>
      </div>
      <div v-if="request.status === 'pending'" class="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700" @click="reject">{{ $t('statuses.rejected') }}</button>
        <button class="rounded-md bg-green-600 px-4 py-2 text-sm text-white" @click="approve">{{ $t('statuses.approved') }}</button>
      </div>
    </div>
  </StaffModalShell>
</template>

<script setup>
import { computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import AvatarInitial from '../shared/AvatarInitial.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ show: Boolean, requestId: Number })
const emit = defineEmits(['close'])
const { t } = useI18n()
const store = useStaffStore()
const request = computed(() => store.medicationRequests.find(r => r.id === props.requestId))

function stockLevel(name) {
  const item = store.inventory.find(i => i.medicineName === name)
  if (!item) return { text: 'Not in stock', color: 'text-red-600' }
  if (item.quantity < 10) return { text: `Stock: ${item.quantity} (low)`, color: 'text-red-600' }
  return { text: `Stock: ${item.quantity}`, color: 'text-green-600' }
}

function approve() { store.approveRequest(props.requestId); store.showToast('Request approved', 'success'); emit('close') }
function reject() { store.rejectRequest(props.requestId); store.showToast('Request rejected', 'success'); emit('close') }
</script>
