<template>
  <StaffModalShell :show="show" title="Appointment Details" @close="$emit('close')">
    <div v-if="appointment" class="space-y-4">
      <div class="flex items-center gap-3">
        <AvatarInitial :name="appointment.patientName" size="lg" />
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ appointment.patientName }}</h3>
          <StatusBadge :status="appointment.status" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><span class="text-slate-500 dark:text-slate-400">Date:</span> <span class="font-semibold">{{ appointment.date }}</span></div>
        <div><span class="text-slate-500 dark:text-slate-400">Time:</span> <span class="font-semibold">{{ appointment.time }}</span></div>
        <div class="col-span-2"><span class="text-slate-500 dark:text-slate-400">Facility:</span> <span class="font-semibold">{{ appointment.facilityName }}</span></div>
        <div class="col-span-2"><span class="text-slate-500 dark:text-slate-400">Notes:</span> <span class="text-slate-700 dark:text-slate-300">{{ appointment.notes }}</span></div>
      </div>
      <div v-if="prescription" class="border-t border-slate-100 dark:border-slate-700 pt-4">
        <h4 class="font-bold text-slate-900 dark:text-slate-100">Prescription</h4>
        <div v-for="med in prescription.medicines" :key="med.name" class="mt-2 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <p class="font-semibold">{{ med.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ med.dosage }} — {{ med.duration }}</p>
        </div>
      </div>
    </div>
  </StaffModalShell>
</template>

<script setup>
import { computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import AvatarInitial from '../shared/AvatarInitial.vue'
import StatusBadge from '../shared/StatusBadge.vue'

const props = defineProps({ show: Boolean, appointmentId: Number })
defineEmits(['close'])
const store = useStaffStore()
const appointment = computed(() => store.appointments.find(a => a.id === props.appointmentId))
const prescription = computed(() => store.prescriptions.find(p => p.patientName === appointment.value?.patientName))
</script>
