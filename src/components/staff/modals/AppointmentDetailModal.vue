<template>
  <StaffModalShell :show="show" :title="$t('pageTitles.appointments')" @close="$emit('close')">
    <div v-if="loading" class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full skeleton-shimmer"></div>
        <div class="space-y-2 flex-1">
          <div class="h-4 w-32 skeleton-shimmer rounded"></div>
          <div class="h-3 w-20 skeleton-shimmer rounded"></div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="space-y-1">
          <div class="h-2 w-16 skeleton-shimmer rounded"></div>
          <div class="h-4 w-24 skeleton-shimmer rounded"></div>
        </div>
      </div>
    </div>
    <div v-else-if="appointment" class="space-y-4">
      <div class="flex items-center gap-3">
        <AvatarInitial :name="appointment.patientName" size="lg" />
        <div>
          <h3 class="text-xl font-bold text-slate-900">{{ appointment.patientName }}</h3>
          <StatusBadge :status="appointment.status" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><span class="text-slate-500">{{ $t('common.date') }}:</span> <span class="font-semibold">{{ appointment.date }}</span></div>
        <div><span class="text-slate-500">{{ $t('common.time') }}:</span> <span class="font-semibold">{{ appointment.time }}</span></div>
        <div class="col-span-2"><span class="text-slate-500">Facility:</span> <span class="font-semibold">{{ appointment.facilityName }}</span></div>
        <div class="col-span-2"><span class="text-slate-500">{{ $t('common.notes') }}:</span> <span class="text-slate-700">{{ appointment.notes }}</span></div>
      </div>
      <div v-if="appointment.prescription" class="border-t border-slate-100 pt-4">
        <h4 class="font-bold text-slate-900">{{ $t('pageTitles.prescriptions') }}</h4>
        <div v-for="med in appointment.prescription.medicines" :key="med.name" class="mt-2 rounded-lg bg-slate-50 p-3">
          <p class="font-semibold">{{ med.name }}</p>
          <p class="text-xs text-slate-500">{{ med.dosage }} — {{ med.duration }}</p>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-sm text-slate-500">
      Failed to load appointment details.
    </div>
  </StaffModalShell>
</template>

<script setup>
import { ref, watch } from 'vue'
import StaffModalShell from './StaffModalShell.vue'
import AvatarInitial from '../shared/AvatarInitial.vue'
import StatusBadge from '../shared/StatusBadge.vue'
import { getAppointment } from '@/services/appointmentService'

const props = defineProps({ show: Boolean, appointmentId: [Number, String] })
defineEmits(['close'])

const loading = ref(false)
const appointment = ref(null)

async function fetchDetail() {
  if (!props.show || !props.appointmentId) return
  loading.value = true
  appointment.value = null
  try {
    const { data } = await getAppointment(props.appointmentId)
    const a = data.data || data
    appointment.value = {
      id: a.id || a.uuid,
      patientName: a.patient?.full_name || a.patient?.name || a.patient_name || '—',
      status: a.status,
      date: a.start_at ? new Date(a.start_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      time: a.start_at ? new Date(a.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
      facilityName: a.facility?.name || a.facility_name || '—',
      notes: a.notes || '',
      prescription: a.prescription || null,
    }
  } catch {
    appointment.value = null
  } finally {
    loading.value = false
  }
}

watch(() => [props.show, props.appointmentId], fetchDetail)
</script>
