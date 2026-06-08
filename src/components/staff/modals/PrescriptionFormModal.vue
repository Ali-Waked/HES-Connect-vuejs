<template>
  <StaffModalShell :show="show" title="New Prescription" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Appointment</label>
        <select v-model="form.appointmentId" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" required>
          <option value="" disabled>Select completed appointment</option>
          <option v-for="a in completedAppts" :key="a.id" :value="a.id">{{ a.patientName }} — {{ a.date }} {{ a.time }}</option>
        </select>
        <p v-if="errors.appointment" class="mt-1 text-xs text-red-500">{{ errors.appointment }}</p>
      </div>
      <div>
        <div class="flex items-center justify-between">
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Medicines</label>
          <button type="button" class="text-sm font-semibold text-brand-primary" @click="addMedicine">+ Add Medicine</button>
        </div>
        <div v-for="(med, i) in form.medicines" :key="i" class="mt-2 flex gap-2 items-start">
          <input v-model="med.name" placeholder="Medicine name" class="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm" required />
          <input v-model="med.dosage" placeholder="Dosage" class="w-40 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm" required />
          <input v-model="med.duration" placeholder="Duration" class="w-28 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm" required />
          <button type="button" class="mt-2 text-red-500 text-sm" @click="removeMedicine(i)" v-if="form.medicines.length > 1">✕</button>
        </div>
        <p v-if="errors.medicines" class="mt-1 text-xs text-red-500">{{ errors.medicines }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300" @click="$emit('close')">Cancel</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">Create Prescription</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const store = useStaffStore()

const completedAppts = computed(() => store.appointments.filter(a => a.status === 'completed'))
const form = reactive({ appointmentId: '', medicines: [{ name: '', dosage: '', duration: '' }] })
const errors = reactive({})

function addMedicine() { form.medicines.push({ name: '', dosage: '', duration: '' }) }
function removeMedicine(i) { if (form.medicines.length > 1) form.medicines.splice(i, 1) }

function submit() {
  errors.appointment = ''
  errors.medicines = ''
  let valid = true
  if (!form.appointmentId) { errors.appointment = 'Please select an appointment'; valid = false }
  const hasEmpty = form.medicines.some(m => !m.name || !m.dosage || !m.duration)
  if (hasEmpty) { errors.medicines = 'Fill all medicine fields'; valid = false }
  if (!valid) return
  const appt = store.appointments.find(a => a.id === Number(form.appointmentId))
  store.addPrescription({ patientName: appt.patientName, appointmentDate: appt.date, medicines: [...form.medicines] })
  store.showToast('Prescription created')
  emit('close')
}
</script>
