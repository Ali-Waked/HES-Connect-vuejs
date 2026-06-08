<template>
  <StaffModalShell :show="show" title="Prescription" width="max-w-lg" @close="$emit('close')">
    <div v-if="prescription" class="space-y-4" id="print-section">
      <div class="border-b border-slate-100 dark:border-slate-700 pb-4 text-center">
        <p class="text-xl font-bold text-slate-900 dark:text-slate-100">Health Garagantam</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">Prescription</p>
      </div>
      <div class="text-sm space-y-1">
        <p><span class="text-slate-500 dark:text-slate-400">Patient:</span> <span class="font-semibold">{{ prescription.patientName }}</span></p>
        <p><span class="text-slate-500 dark:text-slate-400">Date:</span> <span class="font-semibold">{{ prescription.appointmentDate }}</span></p>
      </div>
      <div class="border-t border-slate-100 dark:border-slate-700 pt-4">
        <h4 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Medicines</h4>
        <div v-for="med in prescription.medicines" :key="med.name" class="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 mb-2">
          <p class="font-semibold">{{ med.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ med.dosage }} — {{ med.duration }}</p>
        </div>
      </div>
    </div>
    <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
      <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="print">Print</button>
    </div>
  </StaffModalShell>
</template>

<script setup>
import { computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'

const props = defineProps({ show: Boolean, prescriptionId: Number })
defineEmits(['close'])
const store = useStaffStore()
const prescription = computed(() => store.prescriptions.find(p => p.id === props.prescriptionId))

function print() { window.print() }
</script>
