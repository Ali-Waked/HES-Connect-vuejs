<template>
  <StaffModalShell :show="show" :title="$t('common.add') + ' ' + $t('common.date')" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('pageTitles.appointments') }}</label>
        <select v-model="form.appointmentId" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" required>
          <option value="" disabled>Select completed appointment</option>
          <option v-for="a in completedAppts" :key="a.id" :value="a.id">{{ a.patientName }} — {{ a.date }} {{ a.time }}</option>
        </select>
        <p v-if="errors.appointment" class="mt-1 text-xs text-red-500">{{ errors.appointment }}</p>
      </div>
      <div>
        <div class="flex items-center justify-between">
          <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('sidebar.medicines') }}</label>
          <button type="button" class="text-sm font-semibold text-brand-primary cursor-pointer" @click="addMedicine">+ Add Medicine</button>
        </div>
        <div v-for="(med, i) in form.medicines" :key="i" class="mt-3 p-3 border border-slate-100 rounded-lg space-y-2">
          <div class="flex gap-2">
            <input v-model="med.name_en" dir="ltr" placeholder="Medicine (EN)" class="flex-1 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-3 py-2 text-sm" required />
            <input v-model="med.name_ar" dir="rtl" placeholder="اسم الدواء (AR)" class="flex-1 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-3 py-2 text-sm text-right" required />
          </div>
          <div class="flex gap-2 items-center">
            <input v-model="med.dosage" placeholder="Dosage" class="flex-1 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-3 py-2 text-sm" required />
            <input v-model="med.duration" placeholder="Duration" class="flex-1 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-3 py-2 text-sm" required />
            <button type="button" class="text-red-500 text-sm p-1 cursor-pointer" @click="removeMedicine(i)" v-if="form.medicines.length > 1">✕</button>
          </div>
        </div>
        <p v-if="errors.medicines" class="mt-1 text-xs text-red-500">{{ errors.medicines }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 cursor-pointer" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white cursor-pointer">{{ $t('common.create') }} {{ $t('pageTitles.prescriptions') }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { t } = useI18n()
const { localField } = useLocaleField()
const store = useStaffStore()

const completedAppts = computed(() => store.appointments.filter(a => a.status === 'completed'))
const form = reactive({ appointmentId: '', medicines: [{ name_en: '', name_ar: '', dosage: '', duration: '' }] })
const errors = reactive({})

function addMedicine() { form.medicines.push({ name_en: '', name_ar: '', dosage: '', duration: '' }) }
function removeMedicine(i) { if (form.medicines.length > 1) form.medicines.splice(i, 1) }

function submit() {
  errors.appointment = ''
  errors.medicines = ''
  let valid = true
  if (!form.appointmentId) { errors.appointment = 'Please select an appointment'; valid = false }
  const hasEmpty = form.medicines.some(m => !m.name_en || !m.name_ar || !m.dosage || !m.duration)
  if (hasEmpty) { errors.medicines = 'Fill all medicine fields'; valid = false }
  if (!valid) return
  const appt = store.appointments.find(a => a.id === Number(form.appointmentId))
  store.addPrescription({ 
    patientName: appt.patientName, 
    appointmentDate: appt.date, 
    medicines: [...form.medicines] 
  })
  store.showToast('Prescription created')
  emit('close')
}
</script>
