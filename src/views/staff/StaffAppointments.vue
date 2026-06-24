<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Appointments</h2>
        <p class="text-sm text-slate-500">Manage all patient appointments</p>
        <div v-if="workspaceStore.currentWorkspace" class="flex items-center gap-2 mt-1">
          <span class="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary">
            {{ workspaceStore.currentFacility?.name }}
          </span>
          <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            {{ workspaceStore.currentRole?.name }}
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <input v-model="search" placeholder="Search patient..." class="rounded-lg border border-slate-200 px-3 py-2 text-sm w-48" />
        <input type="date" v-model="dateFilter" class="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="bookModal = true">Book Appointment</button>
      </div>
    </div>

    <div class="flex gap-2">
      <button v-for="tab in tabs" :key="tab.key" class="rounded-md px-4 py-2 text-sm font-semibold transition" :class="activeTab === tab.key ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" @click="activeTab = tab.key; page = 1">{{ tab.label }}</button>
    </div>

    <DataTable :columns="columns" :items="paginated" :loading="loading" empty-title="No appointments found" empty-description="Try changing filters.">
      <template #cell-patientName="{ item }">
        <div class="flex items-center gap-2">
          <AvatarInitial :name="item.patientName" size="sm" />
          <span class="font-semibold text-slate-900">{{ item.patientName }}</span>
        </div>
      </template>
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <button class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700" @click="viewAppt(item)">View</button>
          <button v-if="item.status === 'booked'" class="rounded-md bg-green-600 px-3 py-1.5 text-xs text-white" @click="confirmAction('complete', item)">Complete</button>
          <button v-if="item.status !== 'cancelled'" class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700" @click="confirmAction('cancel', item)">Cancel</button>
          <button v-if="item.status !== 'cancelled' && item.status !== 'completed'" class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700" @click="openReschedule(item)">Reschedule</button>
        </div>
      </template>
    </DataTable>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
      <button :disabled="page <= 1" class="rounded-md border border-slate-200 px-3 py-1.5 text-sm" @click="page--">Prev</button>
      <span class="text-sm text-slate-500">Page {{ page }} of {{ totalPages }}</span>
      <button :disabled="page >= totalPages" class="rounded-md border border-slate-200 px-3 py-1.5 text-sm" @click="page++">Next</button>
    </div>

    <AppointmentDetailModal :show="detailModal" :appointment-id="selectedId" @close="detailModal = false" />
    <RescheduleModal :show="rescheduleModal" :appointment="selectedAppt" @close="rescheduleModal = false" />
    <BookAppointmentModal :show="bookModal" @close="bookModal = false" @booked="onBooked" />
    <ConfirmModal v-model:modelValue="confirm.visible" :title="confirm.title" :message="confirm.message" :confirmText="confirm.confirmText" @confirm="onConfirm" @cancel="confirm.visible = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import DataTable from '@/components/staff/shared/DataTable.vue'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import AppointmentDetailModal from '@/components/staff/modals/AppointmentDetailModal.vue'
import RescheduleModal from '@/components/staff/modals/RescheduleModal.vue'
import BookAppointmentModal from '@/components/staff/modals/BookAppointmentModal.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'
import { getAppointments, cancelAppointment as apiCancelAppointment, forceCompleteAppointment } from '@/services/appointmentService'

const workspaceStore = useWorkspaceStore()
const loading = ref(true)
const search = ref('')
const dateFilter = ref('')
const activeTab = ref('all')
const page = ref(1)
const perPage = 10
const detailModal = ref(false)
const rescheduleModal = ref(false)
const bookModal = ref(false)
const selectedId = ref(null)
const selectedAppt = ref(null)
const serverAppointments = ref([])

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'booked', label: 'Booked' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'rescheduled', label: 'Rescheduled' }
]

const columns = [
  { key: 'patientName', label: 'Patient' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'facilityName', label: 'Facility' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

async function fetchServerAppointments() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: perPage }
    if (activeTab.value !== 'all') params.status = activeTab.value
    if (search.value) params.search = search.value
    if (dateFilter.value) params.date_from = dateFilter.value

    const { data } = await getAppointments(params)
    serverAppointments.value = (data.data || data || []).map(a => ({
      id: a.id || a.uuid,
      patientName: a.patient?.full_name || a.patient?.name || a.patient_name || '—',
      doctorName: a.doctor?.full_name || a.doctor?.name || a.doctor_name || '—',
      facilityName: a.facility?.name || a.facility_name || '—',
      date: a.start_at ? a.start_at.slice(0, 10) : '',
      time: a.start_at ? new Date(a.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
      status: a.status,
      uuid: a.uuid || a.id,
      raw: a,
    }))
  } catch {
    serverAppointments.value = []
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => serverAppointments.value)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated = computed(() => filtered.value)

const confirm = ref({ visible: false, appt: null, action: null, title: '', message: '', confirmText: '' })

watch([search, dateFilter, activeTab], () => { page.value = 1; fetchServerAppointments() })
watch(() => workspaceStore.currentWorkspaceId, () => {
  page.value = 1
  activeTab.value = 'all'
  search.value = ''
  dateFilter.value = ''
  fetchServerAppointments()
})

function viewAppt(item) { selectedId.value = item.id; detailModal.value = true }
function openReschedule(item) { selectedAppt.value = item.raw; rescheduleModal.value = true }

function confirmAction(action, appt) {
  confirm.value.appt = appt; confirm.value.action = action
  if (action === 'complete') { confirm.value.title = 'Complete Appointment'; confirm.value.message = `Mark ${appt.patientName} at ${appt.time} as completed?`; confirm.value.confirmText = 'Complete' }
  else if (action === 'cancel') { confirm.value.title = 'Cancel Appointment'; confirm.value.message = `Cancel ${appt.patientName} at ${appt.time}?`; confirm.value.confirmText = 'Cancel' }
  confirm.value.visible = true
}

async function onConfirm() {
  const appt = confirm.value.appt; const action = confirm.value.action
  if (!appt || !action) return
  try {
    if (action === 'complete') {
      await forceCompleteAppointment(appt.uuid)
    } else if (action === 'cancel') {
      await apiCancelAppointment(appt.uuid)
    }
    fetchServerAppointments()
  } catch {
    // error handled by service
  }
  confirm.value.visible = false
}

function onBooked() {
  fetchServerAppointments()
}

onMounted(fetchServerAppointments)
</script>
