<template>
  <StaffModalShell :show="show" :title="$t('pageTitles.prescriptions')" width="max-w-lg" @close="$emit('close')">
    <div v-if="prescription" class="space-y-4" id="print-section">
      <div class="border-b border-slate-100 pb-4 flex flex-col items-center gap-1">
        <HesLogo variant="full" :height="32" theme="light" />
        <p class="text-sm text-slate-500">{{ $t('pageTitles.prescriptions') }}</p>
      </div>
      <div class="text-sm space-y-1">
        <p><span class="text-slate-500">Patient:</span> <span class="font-semibold">{{ prescription.patientName }}</span></p>
        <p><span class="text-slate-500">Date:</span> <span class="font-semibold">{{ prescription.appointmentDate }}</span></p>
      </div>
      <div class="border-t border-slate-100 pt-4">
        <h4 class="font-bold text-slate-900 mb-2">{{ $t('sidebar.medicines') }}</h4>
        <div v-for="med in prescription.medicines" :key="med.name" class="rounded-lg bg-slate-50 p-3 mb-2">
          <p class="font-semibold">{{ med.name }}</p>
          <p class="text-xs text-slate-500">{{ med.dosage }} — {{ med.duration }}</p>
        </div>
      </div>
    </div>
    <div class="flex justify-end pt-4 border-t border-slate-100">
      <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="print">{{ $t('common.print') }}</button>
    </div>
  </StaffModalShell>
</template>

<script setup>
import { computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import HesLogo from '../../global/HesLogo.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ show: Boolean, prescriptionId: Number })
defineEmits(['close'])
const { t } = useI18n()
const store = useStaffStore()
const prescription = computed(() => store.prescriptions.find(p => p.id === props.prescriptionId))

function print() { window.print() }
</script>
