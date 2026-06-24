<template>
  <div class="animate-fade-in space-y-6">
    <div>
      <h2 class="text-xl font-bold text-slate-900">Medication Requests</h2>
      <p class="text-sm text-slate-500">Approve or reject medicine requests</p>
    </div>

    <div class="flex gap-2">
      <button v-for="tab in tabs" :key="tab.key" class="rounded-md px-4 py-2 text-sm font-semibold transition" :class="activeTab === tab.key ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>

    <DataTable :columns="columns" :items="filtered" :loading="loading" empty-title="No requests found">
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      <template #cell-medicines="{ item }">
        <span class="text-sm">{{ item.medicines.length }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <button v-permission="'medication_requests.view'" class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700" @click="viewRequest(item.id)">View</button>
          <button v-if="item.status === 'pending'" v-permission="'medication_requests.approve'" class="rounded-md bg-green-600 px-3 py-1.5 text-xs text-white" @click="confirmApprove(item)">Approve</button>
          <button v-if="item.status === 'pending'" v-permission="'medication_requests.reject'" class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700" @click="confirmReject(item)">Reject</button>
        </div>
      </template>
    </DataTable>

    <RequestDetailModal :show="detailModal" :request-id="detailId" @close="detailModal = false" />
    <ConfirmModal v-model:modelValue="confirm.visible" :title="confirm.title" :message="confirm.message" :confirmText="confirm.confirmText" @confirm="onConfirm" @cancel="confirm.visible = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import DataTable from '@/components/staff/shared/DataTable.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import RequestDetailModal from '@/components/staff/modals/RequestDetailModal.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'

const store = useStaffStore()
const { can } = useAuthPermissions()
const loading = ref(true)
const activeTab = ref('all')
const detailModal = ref(false)
const detailId = ref(null)

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' }
]

const columns = [
  { key: 'patientName', label: 'Patient' },
  { key: 'medicines', label: 'Medicines' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: 'Actions' }
]

const filtered = computed(() => {
  if (activeTab.value === 'all') return store.medicationRequests
  return store.medicationRequests.filter(r => r.status === activeTab.value)
})

const confirm = ref({ visible: false, request: null, action: null, title: '', message: '', confirmText: '' })

function viewRequest(id) { detailId.value = id; detailModal.value = true }

function confirmApprove(req) {
  if (!can('medication_requests.approve')) return
  confirm.value.request = req; confirm.value.action = 'approve'
  confirm.value.title = 'Approve Request'; confirm.value.message = `Approve medication request for ${req.patientName}? Stock will be deducted.`; confirm.value.confirmText = 'Approve'
  confirm.value.visible = true
}

function confirmReject(req) {
  if (!can('medication_requests.reject')) return
  confirm.value.request = req; confirm.value.action = 'reject'
  confirm.value.title = 'Reject Request'; confirm.value.message = `Reject medication request for ${req.patientName}?`; confirm.value.confirmText = 'Reject'
  confirm.value.visible = true
}

function onConfirm() {
  if (confirm.value.action === 'approve') { store.approveRequest(confirm.value.request.id); store.showToast('Request approved', 'success') }
  else if (confirm.value.action === 'reject') { store.rejectRequest(confirm.value.request.id); store.showToast('Request rejected', 'success') }
  confirm.value.visible = false
}

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
