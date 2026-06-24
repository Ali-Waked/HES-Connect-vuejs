<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  facilities: { type: Array, default: () => [] },
  selectedFacility: { type: Object, default: null },
  schedules: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update', 'delete', 'toggle', 'change-facility'])

const dayLabels = [
  { key: 0, label: () => t('schedule.sunday'), short: () => t('schedule.sun') },
  { key: 1, label: () => t('schedule.monday'), short: () => t('schedule.mon') },
  { key: 2, label: () => t('schedule.tuesday'), short: () => t('schedule.tue') },
  { key: 3, label: () => t('schedule.wednesday'), short: () => t('schedule.wed') },
  { key: 4, label: () => t('schedule.thursday'), short: () => t('schedule.thu') },
  { key: 5, label: () => t('schedule.friday'), short: () => t('schedule.fri') },
  { key: 6, label: () => t('schedule.saturday'), short: () => t('schedule.sat') },
]

const form = ref({
  dayOfWeek: [],
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  isActive: true,
})

const formErrors = ref({})
const showForm = ref(false)

function toggleDay(key) {
  const idx = form.value.dayOfWeek.indexOf(key)
  if (idx === -1) form.value.dayOfWeek.push(key)
  else form.value.dayOfWeek.splice(idx, 1)
}

function validateForm() {
  const errs = {}
  if (form.value.dayOfWeek.length === 0) errs.dayOfWeek = 'Select at least one day'
  if (!form.value.startTime) errs.startTime = 'Required'
  if (!form.value.endTime) errs.endTime = 'Required'
  if (form.value.startTime >= form.value.endTime) errs.endTime = 'End must be after start'
  if (!form.value.slotDuration || form.value.slotDuration < 5) errs.slotDuration = 'Min 5 min'
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

function resetForm() {
  form.value = { dayOfWeek: [], startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: true }
  formErrors.value = {}
  showForm.value = false
}

function handleSubmit() {
  if (!validateForm()) return
  form.value.dayOfWeek.forEach(day => {
    emit('create', {
      day_of_week: day,
      start_time: form.value.startTime,
      end_time: form.value.endTime,
      slot_duration: form.value.slotDuration,
      is_active: form.value.isActive,
      facility_uuid: props.selectedFacility?.uuid,
    })
  })
  resetForm()
}

const groupedSchedules = computed(() => {
  const map = {}
  props.schedules.forEach(s => {
    const key = s.facility_uuid || s.facility_name || 'general'
    if (!map[key]) map[key] = { facilityUuid: s.facility_uuid, facilityName: s.facility_name || t('schedule.allFacilities'), items: [] }
    map[key].items.push(s)
  })
  return Object.values(map)
})

const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function dayName(dayIndex) {
  return weekDayNames[dayIndex] || ''
}

function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function getDayLetters(days) {
  return days.map(d => t('schedule.' + ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d])).join(', ')
}

function handleEdit(schedule) {
  emit('update', schedule)
}

function handleDelete(id) {
  emit('delete', id)
}

function handleToggle(id, isActive) {
  emit('toggle', id, isActive)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Builder Form -->
    <div class="card-base p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('schedule.addSchedule') }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Define your weekly availability</p>
        </div>
        <button
          class="btn-secondary text-sm"
          @click="showForm = !showForm"
        >
          <span class="material-symbols-outlined text-lg">{{ showForm ? 'close' : 'add' }}</span>
          {{ showForm ? 'Cancel' : t('schedule.addSchedule') }}
        </button>
      </div>

      <form v-if="showForm" @submit.prevent="handleSubmit" class="space-y-5">
        <div v-if="props.facilities.length > 1" class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.facility') }}</label>
          <select
            class="input-base"
            v-model="form.facility_uuid"
          >
            <option value="">{{ t('schedule.selectFacility') }}</option>
            <option v-for="f in props.facilities" :key="f.uuid" :value="f.uuid">
              {{ f.name }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.daysOfWeek') }}</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in dayLabels"
              :key="day.key"
              type="button"
              class="px-3.5 py-2 text-xs font-bold rounded-lg border transition cursor-pointer"
              :class="form.dayOfWeek.includes(day.key)
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50'"
              @click="toggleDay(day.key)"
            >
              {{ day.short() }}
            </button>
          </div>
          <p v-if="formErrors.dayOfWeek" class="text-xs text-rose-500 font-semibold">{{ formErrors.dayOfWeek }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.startTime') }}</label>
            <input
              type="time"
              class="input-base"
              v-model="form.startTime"
              :class="formErrors.startTime ? 'border-rose-400' : ''"
            />
            <p v-if="formErrors.startTime" class="text-xs text-rose-500 font-semibold">{{ formErrors.startTime }}</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.endTime') }}</label>
            <input
              type="time"
              class="input-base"
              v-model="form.endTime"
              :class="formErrors.endTime ? 'border-rose-400' : ''"
            />
            <p v-if="formErrors.endTime" class="text-xs text-rose-500 font-semibold">{{ formErrors.endTime }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.slotDuration') }}</label>
            <select class="input-base" v-model="form.slotDuration">
              <option :value="15">15 {{ t('schedule.minutes') }}</option>
              <option :value="30">30 {{ t('schedule.minutes') }}</option>
              <option :value="45">45 {{ t('schedule.minutes') }}</option>
              <option :value="60">60 {{ t('schedule.minutes') }}</option>
            </select>
          </div>
          <div class="flex items-end gap-3 pb-1">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" v-model="form.isActive" />
              <div class="w-9 h-5 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ form.isActive ? t('schedule.active') : t('schedule.inactive') }}</span>
          </div>
        </div>

        <div class="flex gap-3 pt-1">
          <button
            type="submit"
            :disabled="saving"
            class="btn-primary"
          >
            <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {{ t('schedule.addSchedule') }}
          </button>
          <button
            type="button"
            class="btn-secondary"
            @click="resetForm"
          >
            {{ t('common.cancel') || 'Cancel' }}
          </button>
        </div>
      </form>

      <div v-else class="py-2">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-slate-400">info</span>
          <p class="text-xs text-slate-500 dark:text-slate-400">Click <strong>Add Schedule</strong> to define your weekly availability</p>
        </div>
      </div>
    </div>

    <!-- Schedule List grouped by facility -->
    <div class="space-y-4">
      <div v-if="groupedSchedules.length === 0" class="empty-state py-10">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined empty-state-icon-svg">calendar_month</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('schedule.noSchedules') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('schedule.noSchedulesDesc') }}</p>
      </div>

      <div v-for="group in groupedSchedules" :key="group.facilityUuid || group.facilityName" class="card-base overflow-hidden">
        <div class="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-lg text-brand-primary">business</span>
            {{ group.facilityName }}
            <span class="text-xs font-normal text-slate-400 dark:text-slate-500">({{ group.items.length }})</span>
          </h4>
        </div>

        <div class="divide-y divide-slate-100 dark:divide-slate-700/50">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                :class="item.is_active !== false
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'"
              >
                {{ item.slot_duration || item.slotDuration || 30 }}m
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {{ formatTime(item.start_time || item.startTime) }} – {{ formatTime(item.end_time || item.endTime) }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ getDayLetters(item.days_of_week || [item.day_of_week]) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition cursor-pointer"
                :title="item.is_active !== false ? 'Disable' : 'Enable'"
                @click="handleToggle(item.id, item.is_active === false)"
              >
                <span class="material-symbols-outlined text-lg">{{ item.is_active !== false ? 'toggle_on' : 'toggle_off' }}</span>
              </button>
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer"
                :title="t('common.delete') || 'Delete'"
                @click="handleDelete(item.id)"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
