<template>
  <StaffModalShell :show="show" title="Reschedule Appointment" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">New Date</label>
        <input type="date" v-model="date" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required min=""/>
        <p v-if="errors.date" class="mt-1 text-xs text-red-500">{{ errors.date }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">New Time</label>
        <input type="time" v-model="time" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
        <p v-if="errors.time" class="mt-1 text-xs text-red-500">{{ errors.time }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">{{ $t('common.reschedule') }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ show: Boolean, appointment: Object })
const emit = defineEmits(['close'])
const { t } = useI18n()
const store = useStaffStore()
const date = ref('')
const time = ref('')
const errors = reactive({})

function submit() {
  errors.date = ''
  errors.time = ''
  let valid = true
  if (!date.value) { errors.date = 'Date is required'; valid = false }
  if (!time.value) { errors.time = 'Time is required'; valid = false }
  if (!valid) return
  const appt = store.appointments.find(a => a.id === props.appointment.id)
  if (appt) { appt.date = date.value; appt.time = time.value; appt.status = 'rescheduled' }
  store.showToast('Appointment rescheduled', 'success')
  emit('close')
}
</script>
