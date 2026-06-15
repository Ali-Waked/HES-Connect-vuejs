<template>
  <StaffModalShell :show="show" :title="'Patient: ' + resolveTranslatedValue(patient?.name)" width="max-w-2xl" @close="$emit('close')">
    <div v-if="patient">
      <div class="flex items-center gap-4 mb-6">
        <AvatarInitial :name="resolveTranslatedValue(patient.name)" size="lg" />
        <div>
          <h3 class="text-xl font-bold text-slate-900">{{ resolveTranslatedValue(patient.name) }}</h3>
          <p class="text-sm text-slate-500">{{ patient.email }}</p>
        </div>
      </div>
      <div class="flex gap-2 mb-4">
        <button v-for="tab in tabs" :key="tab.key" class="rounded-md px-4 py-2 text-sm font-semibold transition" :class="activeTab === tab.key ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>
      <div v-if="activeTab === 'info'" class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><span class="text-slate-500">Gender:</span> <span class="font-semibold capitalize">{{ patient.gender }}</span></div>
          <div><span class="text-slate-500">Birth Date:</span> <span class="font-semibold">{{ patient.birthDate }}</span></div>
          <div><span class="text-slate-500">Phone:</span> <span class="font-semibold">{{ patient.phone }}</span></div>
          <div class="col-span-2"><span class="text-slate-500">Medical History:</span> <span class="font-semibold">{{ patient.medicalHistory }}</span></div>
        </div>
      </div>
      <div v-else-if="activeTab === 'appointments'">
        <div v-if="patientAppts.length" class="space-y-2">
          <div v-for="a in patientAppts" :key="a.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
            <div><span class="font-semibold">{{ a.date }}</span> <span class="text-slate-500 text-xs">{{ a.time }}</span></div>
            <StatusBadge :status="a.status" />
          </div>
        </div>
        <div v-else class="py-6 text-center text-sm text-slate-500">No appointments found.</div>
      </div>
      <div v-else-if="activeTab === 'prescriptions'">
        <div v-if="patientPrescriptions.length" class="space-y-3">
          <div v-for="p in patientPrescriptions" :key="p.id" class="rounded-lg border border-slate-100 p-3">
            <p class="text-sm text-slate-500">Date: {{ p.appointmentDate }}</p>
            <div v-for="med in p.medicines" :key="med.name" class="mt-1 text-sm"><span class="font-semibold">{{ med.name }}</span> — {{ med.dosage }}, {{ med.duration }}</div>
          </div>
        </div>
        <div v-else class="py-6 text-center text-sm text-slate-500">No prescriptions found.</div>
      </div>
    </div>
  </StaffModalShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import AvatarInitial from '../shared/AvatarInitial.vue'
import StatusBadge from '../shared/StatusBadge.vue'

import { resolveTranslatedValue } from '@/utils/locale'

const props = defineProps({ show: Boolean, patientId: Number })
defineEmits(['close'])
const store = useStaffStore()
const activeTab = ref('info')
const tabs = [{ key: 'info', label: 'Info' }, { key: 'appointments', label: 'Appointments' }, { key: 'prescriptions', label: 'Prescriptions' }]
const patient = computed(() => store.patients.find(p => p.id === props.patientId))
const patientAppts = computed(() => store.appointments.filter(a => a.patientName === resolveTranslatedValue(patient.value?.name)))
const patientPrescriptions = computed(() => store.prescriptions.filter(p => p.patientName === resolveTranslatedValue(patient.value?.name)))
</script>
