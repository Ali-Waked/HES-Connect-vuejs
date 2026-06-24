<template>
  <StaffModalShell :show="show" title="Book Appointment" width="max-w-lg" @close="close">
    <div class="space-y-5">
      <!-- Stepper -->
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span v-for="(s, i) in steps" :key="i" class="flex items-center gap-1">
          <span class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300" :class="step > i ? 'bg-green-500 text-white' : step === i ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'">{{ i + 1 }}</span>
          <span v-if="i < steps.length - 1" class="mx-1 h-px w-4 bg-slate-200 dark:bg-slate-600" />
        </span>
      </div>

      <!-- Step Content with Transition -->
      <Transition name="step" mode="out-in">
        <!-- Step 1: Facility -->
        <div v-if="step === 0" key="facility">
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Facility</label>
          <p v-if="facilitiesLoading" class="text-sm text-slate-400 dark:text-slate-500">Loading facilities...</p>
          <p v-else-if="facilitiesError" class="text-sm text-red-500 dark:text-red-400">{{ facilitiesError }}</p>
          <div v-else-if="facilities.length" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            <button
              v-for="f in facilities"
              :key="f.uuid || f.id"
              class="w-full rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 flex items-center justify-between cursor-pointer"
              :class="selectedFacility?.uuid === f.uuid ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-1 ring-brand-primary' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
              @click="selectedFacility = f"
            >
              <span class="font-semibold text-slate-900 dark:text-white">{{ resolveTranslatedValue(f.name, locale) }}</span>
              <svg v-if="selectedFacility?.uuid === f.uuid" class="w-5 h-5 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            </button>
          </div>
          <p v-else class="text-sm text-slate-400 dark:text-slate-500">No facilities available.</p>
        </div>

        <!-- Step 2: Calendar -->
        <div v-else-if="step === 1" key="calendar">
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Available Calendar</label>
          <p v-if="scheduleLoading" class="text-sm text-slate-400 dark:text-slate-500">Loading schedule...</p>
          <p v-else-if="scheduleError" class="text-sm text-red-500 dark:text-red-400">{{ scheduleError }}</p>
          <div v-else>
            <!-- Month Navigation -->
            <div class="flex items-center justify-between mb-3">
              <button type="button" class="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer" @click="prevMonth">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
              </button>
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ monthLabel }}</span>
              <button type="button" class="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer" @click="nextMonth">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              </button>
            </div>

            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 mb-1">
              <div v-for="d in weekHeaders" :key="d" class="py-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{{ d }}</div>
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1">
              <div v-for="(cell, i) in calendarCells" :key="i">
                <button
                  v-if="cell.day"
                  type="button"
                  class="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150 cursor-pointer"
                  :class="cellClasses(cell)"
                  :disabled="!cell.available"
                  @click="cell.available && (selectedDate = cell.dateStr)"
                >
                  {{ cell.day }}
                </button>
                <div v-else class="w-full aspect-square" />
              </div>
            </div>

            <p v-if="!availableDates.length && !scheduleLoading" class="mt-3 text-sm text-slate-400 dark:text-slate-500 text-center">No available dates.</p>
          </div>
        </div>

        <!-- Step 3: Time Slot -->
        <div v-else-if="step === 2" key="timeslot">
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Choose Time Slot</label>
          <div v-if="timeSlots.length" class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
            <button
              v-for="slot in timeSlots"
              :key="slot.start"
              class="rounded-lg border px-3 py-2 text-center text-sm font-medium transition-all duration-200 cursor-pointer"
              :class="selectedSlot?.start === slot.start ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-1 ring-brand-primary text-brand-primary' : slot.booked ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'"
              :disabled="slot.booked"
              @click="!slot.booked && (selectedSlot = slot)"
            >
              {{ slot.start }} - {{ slot.end }}
            </button>
          </div>
          <p v-else class="text-sm text-slate-400 dark:text-slate-500">No time slots available for this date.</p>
        </div>

        <!-- Step 4: Reason -->
        <div v-else-if="step === 3" key="reason">
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Reason for Visit</label>
          <textarea
            v-model="reason"
            rows="3"
            class="input-base w-full resize-none"
            placeholder="Describe your reason (optional)"
          ></textarea>
        </div>

        <!-- Step 5: Confirm -->
        <div v-else-if="step === 4 && !bookedSuccessfully" key="confirm" class="space-y-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 text-sm border border-slate-100 dark:border-slate-700">
          <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Facility</span><span class="font-semibold text-slate-900 dark:text-white">{{ resolveTranslatedValue(selectedFacility?.name, locale) }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Date</span><span class="font-semibold text-slate-900 dark:text-white">{{ formatDate(selectedDate) }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Time</span><span class="font-semibold text-slate-900 dark:text-white">{{ selectedSlot?.start }} - {{ selectedSlot?.end }}</span></div>
          <div v-if="reason" class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Reason</span><span class="font-semibold text-slate-900 dark:text-white">{{ reason }}</span></div>
        </div>

        <!-- Success Message -->
        <div v-else-if="bookedSuccessfully" key="success" class="flex flex-col items-center py-6 text-center">
          <div class="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">check_circle</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Appointment Booked!</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Your appointment has been confirmed.</p>
        </div>
      </Transition>

      <p v-if="submitError" class="text-sm text-red-500 dark:text-red-400">{{ submitError }}</p>

      <div v-if="!bookedSuccessfully" class="flex justify-between pt-2">
        <button v-if="step > 0" class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" @click="step--">Back</button>
        <span v-else />
        <button
          v-if="step < 4"
          class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-brand-primary-dark transition-colors cursor-pointer"
          :disabled="!canProceed"
          @click="step++"
        >Next</button>
        <button
          v-else
          class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-brand-primary-dark transition-colors cursor-pointer"
          :disabled="submitting"
          @click="submit"
        >{{ submitting ? 'Booking...' : 'Confirm Appointment' }}</button>
      </div>
    </div>
  </StaffModalShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useStaffStore } from '@/stores/useStaffStore'
import { resolveTranslatedValue } from '@/utils/locale'
import StaffModalShell from './StaffModalShell.vue'
import { getStaffFacilitiesById, getAvailableDays, getAvailableSlots } from '@/services/staffFacilityService'
import { createAppointment } from '@/services/appointmentService'

const props = defineProps({
  show: Boolean,
  staffUuid: { type: String, default: '' }
})
const emit = defineEmits(['close', 'booked'])

const auth = useAuthStore()
const workspaceStore = useWorkspaceStore()
const staffStore = useStaffStore()
const { locale } = useI18n()

const steps = ['Facility', 'Calendar', 'Time Slot', 'Reason', 'Confirm']
const step = ref(0)

const facilities = ref([])
const facilitiesLoading = ref(false)
const facilitiesError = ref('')
const selectedFacility = ref(null)

const scheduleLoading = ref(false)
const scheduleError = ref('')
const availableDates = ref([])
const selectedDate = ref('')

const timeSlots = ref([])
const selectedSlot = ref(null)

const reason = ref('')
const submitting = ref(false)
const submitError = ref('')
const bookedSuccessfully = ref(false)

const staffId = computed(() => props.staffUuid || workspaceStore.currentWorkspace?.uuid || auth.user?.uuid)

const canProceed = computed(() => {
  if (step.value === 0) return !!selectedFacility.value
  if (step.value === 1) return !!selectedDate.value
  if (step.value === 2) return !!selectedSlot.value
  if (step.value === 3) return true
  return true
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

async function loadFacilities() {
  if (!staffId.value) return
  facilitiesLoading.value = true
  facilitiesError.value = ''
  try {
    const { data } = await getStaffFacilitiesById(staffId.value)
    facilities.value = data.data || data || []
  } catch (err) {
    facilitiesError.value = err.response?.data?.message || 'Failed to load facilities'
  } finally {
    facilitiesLoading.value = false
  }
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

async function loadSchedule() {
  if (!staffId.value || !selectedFacility.value?.uuid) return
  scheduleLoading.value = true
  scheduleError.value = ''
  try {
    const { data } = await getAvailableDays(selectedFacility.value.uuid, staffId.value)
    const dates = data.data || data || []
    availableDates.value = dates.map(d => {
      const dt = new Date(d + 'T00:00:00')
      return { date: d, day_name: dayNames[dt.getDay()] || '' }
    }).sort((a, b) => a.date.localeCompare(b.date))
  } catch (err) {
    scheduleError.value = err.response?.data?.message || 'Failed to load available days'
  } finally {
    scheduleLoading.value = false
  }
}

async function loadSlots() {
  if (!staffId.value || !selectedDate.value || !selectedFacility.value?.uuid) return
  scheduleLoading.value = true
  scheduleError.value = ''
  try {
    const { data } = await getAvailableSlots(selectedFacility.value.uuid, staffId.value, { date: selectedDate.value })
    const raw = data.data || data || []
    timeSlots.value = raw.map(s => ({
      start: (s.start_at || s.start_time || s.start || '').slice(11, 16),
      end: (s.end_at || s.end_time || s.end || '').slice(11, 16),
      booked: !!s.booked,
    }))
  } catch (err) {
    scheduleError.value = err.response?.data?.message || 'Failed to load available slots'
    timeSlots.value = []
  } finally {
    scheduleLoading.value = false
  }
}

const currentMonth = ref(new Date())

const monthLabel = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const availableDateSet = computed(() => {
  return new Set(availableDates.value.map(d => d.date))
})

const calendarCells = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const today = new Date().toISOString().slice(0, 10)
    cells.push({
      day: d,
      dateStr,
      available: availableDateSet.value.has(dateStr) && dateStr >= today,
      isPast: dateStr < today,
      isSelected: selectedDate.value === dateStr
    })
  }
  return cells
})

function cellClasses(cell) {
  if (!cell.day) return ''
  if (cell.isSelected) return 'bg-brand-primary text-white font-bold ring-2 ring-brand-primary ring-offset-1 dark:ring-offset-slate-900'
  if (cell.available) return 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 font-semibold'
  if (cell.isPast) return 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
  return 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
}

function prevMonth() {
  const m = new Date(currentMonth.value)
  m.setMonth(m.getMonth() - 1)
  currentMonth.value = m
}

function nextMonth() {
  const m = new Date(currentMonth.value)
  m.setMonth(m.getMonth() + 1)
  currentMonth.value = m
}

watch(() => props.show, (v) => {
  if (v) {
    step.value = 0
    selectedFacility.value = null
    selectedDate.value = ''
    selectedSlot.value = null
    reason.value = ''
    submitError.value = ''
    facilities.value = []
    currentMonth.value = new Date()
    loadFacilities()
  }
})

watch(step, (v) => {
  if (v === 1 && selectedFacility.value) {
    availableDates.value = []
    selectedDate.value = ''
    selectedSlot.value = null
    timeSlots.value = []
    loadSchedule()
  }
  if (v === 2) {
    timeSlots.value = []
    selectedSlot.value = null
    loadSlots()
  }
})

function close() { emit('close') }

async function submit() {
  if (submitting.value) return
  submitting.value = true
  submitError.value = ''
  try {
    await createAppointment({
      facility_uuid: selectedFacility.value?.uuid,
      doctor_uuid: staffId.value,
      start_at: `${selectedDate.value} ${selectedSlot.value.start}:00`,
      reason: reason.value || undefined,
    })
    bookedSuccessfully.value = true
    setTimeout(() => {
      staffStore.showToast('Appointment booked successfully', 'success')
      emit('booked')
      close()
    }, 1500)
  } catch (err) {
    submitError.value = err.response?.data?.message || 'Failed to book appointment'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: all 0.25s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
</style>
