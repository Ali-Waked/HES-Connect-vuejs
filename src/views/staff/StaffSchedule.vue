<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStaffStore } from '@/stores/useStaffStore'
import { useSchedules } from '@/composables/useSchedules'
import AddStaffScheduleModal from '@/components/staff/schedule/AddStaffScheduleModal.vue'
import UnavailabilityCard from '@/components/staff/schedule/UnavailabilityCard.vue'
import WeeklyPreviewCard from '@/components/staff/schedule/WeeklyPreviewCard.vue'
import ScheduleEditDrawer from '@/components/staff/schedule/ScheduleEditDrawer.vue'

const { t } = useI18n()
const staffStore = useStaffStore()

function toast(msg, type = 'success') {
  staffStore.showToast(msg, type)
}

const {
  schedules, loading, saving, facilities, selectedFacility,
  fetchSchedules, createSchedule, updateSchedule, deleteSchedule, toggleScheduleStatus, changeFacility,
} = useSchedules({ toast: toast })

const addModalOpen = ref(false)
const activeTab = ref('all')
const editingSchedule = ref(null)
const editDrawerOpen = ref(false)
const deleteConfirmId = ref(null)

const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekDayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dayName(dayIndex) {
  return weekDayNames[dayIndex] || ''
}

function dayShort(dayIndex) {
  return weekDayShort[dayIndex] || ''
}

function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const tabs = [
  { key: 'all', label: 'schedule.allSchedules' },
  { key: 'active', label: 'schedule.active' },
  { key: 'inactive', label: 'schedule.inactive' },
]

const filteredSchedules = computed(() => {
  if (activeTab.value === 'active') return schedules.value.filter(s => s.is_active !== false)
  if (activeTab.value === 'inactive') return schedules.value.filter(s => s.is_active === false)
  return schedules.value
})

const stats = computed(() => {
  const total = schedules.value.length
  const active = schedules.value.filter(s => s.is_active !== false).length
  const inactive = total - active
  let totalMinutes = 0
  schedules.value.forEach(s => {
    if (s.is_active !== false) {
      const st = s.start_time || s.startTime || '09:00'
      const et = s.end_time || s.endTime || '17:00'
      const [sh, sm] = st.split(':').map(Number)
      const [eh, em] = et.split(':').map(Number)
      totalMinutes += (eh * 60 + em) - (sh * 60 + sm)
    }
  })
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return { total, active, inactive, hours, mins }
})

function handleToggle(id, isActive) {
  toggleScheduleStatus(id, isActive)
}

function handleDeleteStart(id) {
  deleteConfirmId.value = id
}

function handleDeleteCancel() {
  deleteConfirmId.value = null
}

async function handleDeleteConfirm(id) {
  await deleteSchedule(id)
  deleteConfirmId.value = null
}

function handleEdit(schedule) {
  editingSchedule.value = schedule
  editDrawerOpen.value = true
}

function handleEditDrawerClose() {
  editDrawerOpen.value = false
  editingSchedule.value = null
}

async function handleEditDrawerSave(formData) {
  if (!editingSchedule.value) return
  await updateSchedule(editingSchedule.value.id, formData)
  editDrawerOpen.value = false
  editingSchedule.value = null
}

function handleFacilityChange(value) {
  if (!value) return
  const facility = facilities.value.find(f => (f.uuid || f.id) === value)
  if (facility) changeFacility(facility)
}

async function handleSaveSchedule(formData) {
  const result = await createSchedule(formData)
  if (result.success) {
    addModalOpen.value = false
    fetchSchedules()
  }
}

const groupedByDay = computed(() => {
  const map = {}
  filteredSchedules.value.forEach(s => {
    const day = s.day_of_week !== undefined ? s.day_of_week : 0
    if (!map[day]) map[day] = []
    map[day].push(s)
  })
  return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b))
})

onMounted(async () => {
  await fetchSchedules()
  if (facilities.length > 0 && !selectedFacility.value) {
    changeFacility(facilities[0])
  }
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('schedule.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ t('schedule.description') }}</p>
      </div>
      <button class="btn-primary" @click="addModalOpen = true">
        <span class="material-symbols-outlined text-lg">add</span>
        {{ t('schedule.addSchedule') }}
      </button>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="card-base p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-brand-primary text-xl">calendar_month</span>
        </div>
        <div>
          <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.total }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('schedule.totalSchedules') }}</p>
        </div>
      </div>
      <div class="card-base p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
        </div>
        <div>
          <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.active }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('schedule.active') }}</p>
        </div>
      </div>
      <div class="card-base p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-slate-400 text-xl">cancel</span>
        </div>
        <div>
          <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.inactive }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('schedule.inactive') }}</p>
        </div>
      </div>
      <div class="card-base p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-blue-500 text-xl">schedule</span>
        </div>
        <div>
          <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.hours }}h{{ stats.mins ? ' ' + stats.mins + 'm' : '' }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('schedule.weeklyHours') }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs + Facility Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button
          v-for="tab in tabs" :key="tab.key"
          class="px-4 py-2 text-sm font-semibold rounded-md transition cursor-pointer"
          :class="activeTab === tab.key
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="activeTab = tab.key"
        >
          {{ t(tab.label) }}
        </button>
      </div>
      <div v-if="facilities.length > 1" class="flex items-center gap-2">
        <span class="material-symbols-outlined text-sm text-slate-400">business</span>
        <select
          class="input-base py-2 px-3 text-sm min-w-[180px]"
          :value="selectedFacility?.uuid || selectedFacility?.id"
          @change="handleFacilityChange($event.target.value)"
        >
          <option value="">{{ t('schedule.selectFacility') }}</option>
          <option v-for="f in facilities" :key="f.uuid || f.id" :value="f.uuid || f.id">
            {{ f.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Schedule List -->
    <div class="card-base overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('schedule.mySchedules') }}</h3>
        <span class="text-xs text-slate-400">{{ filteredSchedules.length }} {{ filteredSchedules.length === 1 ? 'entry' : 'entries' }}</span>
      </div>

      <div v-if="loading" class="p-5 space-y-3">
        <div v-for="i in 4" :key="i" class="skeleton-shimmer h-16 rounded-lg"></div>
      </div>

      <div v-else-if="filteredSchedules.length === 0" class="empty-state py-12">
        <span class="material-symbols-outlined empty-state-icon-svg text-4xl">calendar_month</span>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">{{ t('schedule.noSchedules') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('schedule.noSchedulesDesc') }}</p>
      </div>

      <!-- Group by Day -->
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-700/50">
        <div v-for="[dayIdx, daySchedules] in groupedByDay" :key="dayIdx" class="px-5 py-1">
          <div class="flex items-center gap-3 py-3">
            <div class="w-14 shrink-0 text-center">
              <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{{ dayShort(Number(dayIdx)) }}</p>
            </div>
            <div class="flex-1 space-y-1.5">
              <div
                v-for="item in daySchedules"
                :key="item.id"
                class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg transition cursor-pointer"
                :class="item.is_active !== false
                  ? 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'bg-slate-50/50 dark:bg-slate-800/20 opacity-60 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800'"
                @click="handleEdit(item)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="shrink-0 w-2 h-2 rounded-full"
                    :class="item.is_active !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
                  ></div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">
                      {{ formatTime(item.start_time || item.startTime) }} – {{ formatTime(item.end_time || item.endTime) }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[13px]">business</span>
                      <span>{{ item.facility_name || t('schedule.selectFacility') }}</span>
                      <span class="mx-1">·</span>
                      {{ item.slot_duration || item.slotDuration || 30 }} {{ t('schedule.minutes') }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0" @click.stop>
                  <button
                    class="p-1.5 rounded-lg transition cursor-pointer"
                    :class="item.is_active !== false
                      ? 'text-brand-primary hover:bg-brand-primary/10'
                      : 'text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'"
                    :title="item.is_active !== false ? t('schedule.inactive') : t('schedule.active')"
                    @click="handleToggle(item.id, item.is_active === false)"
                  >
                    <span class="material-symbols-outlined text-lg">{{ item.is_active !== false ? 'toggle_on' : 'toggle_off' }}</span>
                  </button>
                  <div class="relative">
                    <button
                      class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer"
                      :title="t('common.delete')"
                      @click="handleDeleteStart(item.id)"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                    <div
                      v-if="deleteConfirmId === item.id"
                      class="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 p-3 min-w-[200px] animate-fade-in"
                    >
                      <p class="text-xs text-slate-600 dark:text-slate-300 mb-2 font-medium">{{ t('schedule.deleteConfirm') }}</p>
                      <div class="flex gap-2">
                        <button
                          class="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition cursor-pointer"
                          @click="handleDeleteConfirm(item.id)"
                        >
                          {{ t('common.delete') }}
                        </button>
                        <button
                          class="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-lg transition cursor-pointer"
                          @click="handleDeleteCancel"
                        >
                          {{ t('common.cancel') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unavailability + Preview side by side -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UnavailabilityCard />
      <WeeklyPreviewCard
        :schedules="schedules"
        :unavailability="[]"
        :loading="loading"
      />
    </div>

    <!-- Add Schedule Modal -->
    <AddStaffScheduleModal
      :show="addModalOpen"
      :saving="saving"
      @close="addModalOpen = false"
      @save="handleSaveSchedule"
    />

    <!-- Edit Drawer -->
    <ScheduleEditDrawer
      :show="editDrawerOpen"
      :schedule="editingSchedule"
      :saving="saving"
      @close="handleEditDrawerClose"
      @save="handleEditDrawerSave"
      @toggle="(id, isActive) => handleToggle(id, isActive)"
      @delete="(id) => handleDeleteConfirm(id)"
    />
  </div>
</template>
