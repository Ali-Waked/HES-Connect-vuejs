<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import { useMyFacilities } from '@/composables/useMyFacilities'
import { getSchedules, getUnavailability } from '@/services/scheduleService'
import CalendarToolbar from './CalendarToolbar.vue'
import TimeGrid from './TimeGrid.vue'
import CalendarLegend from './CalendarLegend.vue'
import EventDetailsDialog from './EventDetailsDialog.vue'

const {
  weekDays, hours, startHour, endHour, weekLabel,
  nextWeek, prevWeek, goToToday,
} = useCalendar()

const { facilities, loading: facilitiesLoading, fetchFacilities } = useMyFacilities()

const selectedFacilityUuid = ref(null)
const schedules = ref([])
const unavailabilities = ref([])
const loading = ref(false)

const selectedEvent = ref(null)
const selectedEventType = ref('schedule')
const showDialog = ref(false)

const facilityColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

const facilityColorMap = computed(() => {
  const map = {}
  facilities.value.forEach((f, i) => {
    map[f.uuid] = facilityColors[i % facilityColors.length]
  })
  return map
})

const activeFacilities = computed(() => {
  if (selectedFacilityUuid.value) {
    return facilities.value.filter(f => f.uuid === selectedFacilityUuid.value)
  }
  return facilities.value
})

const legendFacilities = computed(() => {
  return activeFacilities.value.map((f, i) => ({
    ...f,
    color: facilityColorMap.value[f.uuid] || facilityColors[i % facilityColors.length],
  }))
})

async function loadAllData() {
  loading.value = true
  const facilityUuids = selectedFacilityUuid.value
    ? [selectedFacilityUuid.value]
    : facilities.value.map(f => f.uuid)

  const allSchedules = []
  const allUnavailabilities = []

  await Promise.all(
    facilityUuids.map(async (uuid) => {
      try {
        const { data } = await getSchedules({ facility_uuid: uuid })
        const items = data.data || data || []
        items.forEach(s => { s._facilityUuid = uuid })
        allSchedules.push(...items)
      } catch {}
      try {
        const { data } = await getUnavailability(uuid)
        const items = data.data || data || []
        items.forEach(u => { u._facilityUuid = uuid })
        allUnavailabilities.push(...items)
      } catch {}
    })
  )

  schedules.value = allSchedules
  unavailabilities.value = allUnavailabilities
  loading.value = false
}

function handleFacilityChange(uuid) {
  selectedFacilityUuid.value = uuid
}

function handleClickSchedule(schedule) {
  selectedEvent.value = schedule
  selectedEventType.value = 'schedule'
  showDialog.value = true
}

function handleClickUnavailability(unavail) {
  selectedEvent.value = unavail
  selectedEventType.value = 'unavailability'
  showDialog.value = true
}

function handleCloseDialog() {
  showDialog.value = false
  selectedEvent.value = null
}

watch(facilities, () => {
  if (facilities.value.length > 0) {
    loadAllData()
  }
}, { immediate: true })

onMounted(async () => {
  await fetchFacilities()
})
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Calendar</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your weekly schedule and unavailability</p>
      </div>
    </div>

    <!-- Toolbar -->
    <CalendarToolbar
      :facilities="facilities"
      :selected-facility="facilities.find(f => f.uuid === selectedFacilityUuid)"
      :week-label="weekLabel"
      @update:selected-facility="handleFacilityChange"
      @prev-week="prevWeek"
      @next-week="nextWeek"
      @today="goToToday"
    />

    <!-- Loading -->
    <div v-if="loading || facilitiesLoading" class="flex items-center justify-center py-12">
      <svg class="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="schedules.length === 0 && unavailabilities.length === 0"
      class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center"
    >
      <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">No working schedule found.</p>
      <p class="text-xs text-slate-400 dark:text-slate-500">Create your first schedule to see it here.</p>
    </div>

    <!-- Calendar -->
    <TimeGrid
      v-else
      :week-days="weekDays"
      :hours="hours"
      :start-hour="startHour"
      :end-hour="endHour"
      :schedules="schedules"
      :unavailabilities="unavailabilities"
      :facility-colors="facilityColorMap"
      @click-schedule="handleClickSchedule"
      @click-unavailability="handleClickUnavailability"
    />

    <!-- Legend -->
    <CalendarLegend :facilities="legendFacilities" />

    <!-- Event Details Dialog -->
    <EventDetailsDialog
      :show="showDialog"
      :event="selectedEvent"
      :type="selectedEventType"
      @close="handleCloseDialog"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
