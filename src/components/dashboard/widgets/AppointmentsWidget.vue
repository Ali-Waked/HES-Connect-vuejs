<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Today's Appointments</h3>
        <p class="text-sm text-slate-500">Appointments for today, sorted by time</p>
      </div>
      <button class="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" @click="$router.push('/facility/appointments')">View all</button>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else>
        <template v-if="appointments.length">
          <ul class="space-y-3">
            <li v-for="appt in sorted" :key="appt.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:shadow-md transition">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 font-bold">{{ appt.time }}</div>
                <div>
                  <div class="font-semibold text-slate-900">{{ resolveTranslatedValue(appt.patientName) }}</div>
                  <div class="text-xs text-slate-500">{{ resolveTranslatedValue(appt.facilityName) }}</div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <StatusBadge :status="appt.status" />
                <div class="flex gap-2" v-if="showActions">
                  <button v-if="appt.status !== 'completed'" class="rounded-md bg-brand-primary px-3 py-1.5 text-sm text-white" @click="openConfirm('complete', appt)">Complete</button>
                  <button v-if="appt.status !== 'cancelled'" class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700" @click="openConfirm('cancel', appt)">Cancel</button>
                </div>
              </div>
            </li>
          </ul>
        </template>

        <div v-else class="text-center py-8">
          <span class="material-symbols-outlined text-4xl text-slate-300">calendar_today</span>
          <p class="mt-2 text-sm font-bold text-slate-900">No appointments today</p>
          <p class="mt-1 text-sm text-slate-500">No appointments scheduled for today.</p>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-model:modelValue="confirm.visible"
      :title="confirm.title"
      :message="confirm.message"
      :confirmText="confirm.confirmText"
      :cancelText="confirm.cancelText"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useWorkspaceStore } from '@/stores/workspace'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'
import { resolveTranslatedValue } from '@/utils/locale'
import { getLiveAppointments, forceCompleteAppointment, cancelAppointment } from '@/services/appointmentService'

const props = defineProps({
  showActions: { type: Boolean, default: false }
})

const { can } = useAuthPermissions()
const workspaceStore = useWorkspaceStore()
const loading = ref(true)
const liveAppointments = ref([])

async function fetchTodayAppointments() {
  loading.value = true
  try {
    const { data } = await getLiveAppointments()
    liveAppointments.value = (data.data || data || []).map(a => ({
      id: a.id || a.uuid,
      patientName: a.patient?.name || a.patient_name || '—',
      facilityName: a.facility?.name || a.facility_name || '—',
      time: a.start_at ? new Date(a.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
      status: a.status,
      uuid: a.uuid || a.id,
    }))
  } catch {
    liveAppointments.value = []
  } finally {
    loading.value = false
  }
}

const appointments = computed(() => liveAppointments.value)
const sorted = computed(() => [...appointments.value].sort((a, b) => a.time.localeCompare(b.time)))

const confirm = ref({ visible: false, appt: null, action: null, title: '', message: '', confirmText: 'Confirm', cancelText: 'Cancel' })

function openConfirm(action, appt) {
  confirm.value.appt = appt
  confirm.value.action = action
  if (action === 'complete') {
    confirm.value.title = 'Mark Appointment Completed'
    confirm.value.message = `Mark appointment with ${resolveTranslatedValue(appt.patientName)} at ${appt.time} as completed?`
    confirm.value.confirmText = 'Complete'
  } else if (action === 'cancel') {
    confirm.value.title = 'Cancel Appointment'
    confirm.value.message = `Cancel appointment with ${resolveTranslatedValue(appt.patientName)} at ${appt.time}?`
    confirm.value.confirmText = 'Cancel'
  }
  confirm.value.visible = true
}

async function onConfirm() {
  const appt = confirm.value.appt
  const action = confirm.value.action
  if (!appt || !action) return
  try {
    if (action === 'complete') {
      await forceCompleteAppointment(appt.uuid)
    } else if (action === 'cancel') {
      await cancelAppointment(appt.uuid)
    }
    fetchTodayAppointments()
  } catch {
    // error handled by service
  }
  confirm.value.visible = false
}

function onCancel() {
  confirm.value.visible = false
}

watch(() => workspaceStore.currentWorkspaceId, () => {
  fetchTodayAppointments()
})

onMounted(fetchTodayAppointments)
</script>
