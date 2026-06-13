<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Prescriptions</h2>
        <p class="text-sm text-slate-500">Manage prescribed medicines</p>
      </div>
      <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="formModal = true">+ New Prescription</button>
    </div>

    <DataTable :columns="columns" :items="store.prescriptions" :loading="loading" empty-title="No prescriptions" empty-description="Create a new prescription to get started.">
      <template #cell-medicines="{ item }">
        <span class="text-sm">{{ item.medicines.length }} medicines</span>
      </template>
      <template #cell-actions="{ item }">
        <button class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700" @click="viewPrescription(item.id)">View</button>
      </template>
    </DataTable>

    <PrescriptionFormModal :show="formModal" @close="formModal = false" />
    <PrescriptionViewModal :show="viewModal" :prescription-id="viewId" @close="viewModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import DataTable from '@/components/staff/shared/DataTable.vue'
import PrescriptionFormModal from '@/components/staff/modals/PrescriptionFormModal.vue'
import PrescriptionViewModal from '@/components/staff/modals/PrescriptionViewModal.vue'

const store = useStaffStore()
const loading = ref(true)
const formModal = ref(false)
const viewModal = ref(false)
const viewId = ref(null)

const columns = [
  { key: 'patientName', label: 'Patient' },
  { key: 'appointmentDate', label: 'Appointment Date' },
  { key: 'medicines', label: 'Medicines' },
  { key: 'actions', label: 'Actions' }
]

function viewPrescription(id) { viewId.value = id; viewModal.value = true }

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
