<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStaffFacilities } from '@/composables/useStaffFacilities'

const props = defineProps({
  show: Boolean,
  saving: { type: Boolean, default: false },
})

const { facilities, loading: facilitiesLoading, fetchFacilities } = useStaffFacilities()

const emit = defineEmits(['close', 'save'])

const { t } = useI18n()

const currentStep = ref(1)

const selectedFacility = ref(null)

const form = ref({
  daysOfWeek: [],
  start_time: '09:00',
  end_time: '17:00',
  slot_duration: 30,
})

const formErrors = ref({})

const dayLabels = [
  { key: 0, label: 'Sunday', short: 'Sun' },
  { key: 1, label: 'Monday', short: 'Mon' },
  { key: 2, label: 'Tuesday', short: 'Tue' },
  { key: 3, label: 'Wednesday', short: 'Wed' },
  { key: 4, label: 'Thursday', short: 'Thu' },
  { key: 5, label: 'Friday', short: 'Fri' },
  { key: 6, label: 'Saturday', short: 'Sat' },
]

function toggleDay(key) {
  const idx = form.value.daysOfWeek.indexOf(key)
  if (idx === -1) form.value.daysOfWeek.push(key)
  else form.value.daysOfWeek.splice(idx, 1)
}

function validateStep1() {
  const errs = {}
  if (!selectedFacility.value) errs.facility = 'Please select a facility'
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

function validateStep2() {
  const errs = {}
  if (form.value.daysOfWeek.length === 0) errs.daysOfWeek = 'Select at least one day'
  if (!form.value.start_time) errs.start_time = 'Required'
  if (!form.value.end_time) errs.end_time = 'Required'
  if (form.value.start_time >= form.value.end_time) errs.end_time = 'End time must be after start time'
  if (form.value.slot_duration < 5) errs.slot_duration = 'Minimum 5 minutes'
  if (form.value.slot_duration > 240) errs.slot_duration = 'Maximum 4 hours'
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

function nextStep() {
  if (currentStep.value === 1 && validateStep1()) {
    currentStep.value = 2
  } else if (currentStep.value === 2 && validateStep2()) {
    currentStep.value = 3
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

async function handleSubmit() {
  emit('save', {
    days_of_week: form.value.daysOfWeek,
    start_time: form.value.start_time,
    end_time: form.value.end_time,
    slot_duration: form.value.slot_duration,
    facility_uuid: selectedFacility.value?.uuid,
  })
}

function resetForm() {
  currentStep.value = 1
  selectedFacility.value = null
  form.value = { daysOfWeek: [], start_time: '09:00', end_time: '17:00', slot_duration: 30 }
  formErrors.value = {}
}

watch(() => props.show, (v) => {
  if (v) {
    resetForm()
    fetchFacilities()
  }
})

const facilityDisplayName = computed(() => {
  if (!selectedFacility.value) return t('schedule.selectFacility')
  return selectedFacility.value.name
})

const reviewItems = computed(() => {
  if (!selectedFacility.value) return []
  const items = []
  form.value.daysOfWeek.forEach(day => {
    const dayLabel = dayLabels.find(d => d.key === day)?.label || ''
    items.push({
      day: dayLabel,
      time: `${form.value.start_time} - ${form.value.end_time}`,
      duration: `${form.value.slot_duration} ${t('schedule.minutes')}`,
      facility: facilityDisplayName.value,
    })
  })
  return items
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 animate-scale-in">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('schedule.addSchedule') }}</h3>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" @click="emit('close')">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Step Indicator -->
        <div class="flex items-center gap-1 mb-6">
          <div
            v-for="step in 3"
            :key="step"
            class="flex-1 h-1.5 rounded-full transition-colors"
            :class="step <= currentStep ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'"
          ></div>
        </div>

        <!-- Step 1: Select Facility -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div v-if="facilitiesLoading" class="flex items-center justify-center py-8">
            <svg class="w-6 h-6 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
          <template v-else>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.facility') }}</label>
              <select
                class="input-base"
                :class="formErrors.facility ? 'border-rose-400' : ''"
                v-model="selectedFacility"
              >
                <option :value="null" disabled>{{ t('schedule.selectFacility') }}</option>
                <option
                  v-for="fac in facilities"
                  :key="fac.uuid || fac.id"
                  :value="fac"
                >
                  {{ fac.name }}
                </option>
              </select>
              <p v-if="formErrors.facility" class="text-xs text-rose-500">{{ formErrors.facility }}</p>
            </div>
          </template>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-primary flex-1 justify-center" @click="nextStep">
              {{ t('common.next') || 'Next' }}
            </button>
            <button type="button" class="btn-secondary flex-1 justify-center" @click="emit('close')">
              {{ t('common.cancel') || 'Cancel' }}
            </button>
          </div>
        </div>

        <!-- Step 2: Select Days & Times -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.daysOfWeek') }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="day in dayLabels"
                :key="day.key"
                type="button"
                class="px-3.5 py-2 text-xs font-bold rounded-lg border transition cursor-pointer"
                :class="form.daysOfWeek.includes(day.key)
                  ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50'"
                @click="toggleDay(day.key)"
              >
                {{ day.short }}
              </button>
            </div>
            <p v-if="formErrors.daysOfWeek" class="text-xs text-rose-500">{{ formErrors.daysOfWeek }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.startTime') }}</label>
              <input
                type="time"
                class="input-base"
                :class="formErrors.start_time ? 'border-rose-400' : ''"
                v-model="form.start_time"
              />
              <p v-if="formErrors.start_time" class="text-xs text-rose-500">{{ formErrors.start_time }}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.endTime') }}</label>
              <input
                type="time"
                class="input-base"
                :class="formErrors.end_time ? 'border-rose-400' : ''"
                v-model="form.end_time"
              />
              <p v-if="formErrors.end_time" class="text-xs text-rose-500">{{ formErrors.end_time }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.slotDuration') }}</label>
            <input
              type="number"
              class="input-base"
              :class="formErrors.slot_duration ? 'border-rose-400' : ''"
              v-model.number="form.slot_duration"
              min="5"
              max="240"
            />
            <p v-if="formErrors.slot_duration" class="text-xs text-rose-500">{{ formErrors.slot_duration }}</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-primary flex-1 justify-center" @click="nextStep">
              {{ t('common.next') || 'Next' }}
            </button>
            <button type="button" class="btn-secondary flex-1 justify-center" @click="prevStep">
              {{ t('common.back') || 'Back' }}
            </button>
          </div>
        </div>

        <!-- Step 3: Review & Confirm -->
        <div v-if="currentStep === 3" class="space-y-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Review your schedule before saving</p>

          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div
              v-for="(item, idx) in reviewItems"
              :key="idx"
              class="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700"
            >
              <div class="shrink-0 w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-sm font-bold text-brand-primary">
                {{ item.day.slice(0, 3) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.day }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ item.time }} · {{ item.duration }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">business</span>
                  {{ item.facility }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              :disabled="saving"
              class="btn-primary flex-1 justify-center"
              @click="handleSubmit"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {{ t('common.save') || 'Save' }}
            </button>
            <button type="button" class="btn-secondary flex-1 justify-center" @click="prevStep">
              {{ t('common.back') || 'Back' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
