<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStaffUnavailability } from '@/composables/useStaffUnavailability'
import { useStaffFacilities } from '@/composables/useStaffFacilities'

const { t } = useI18n()

const { unavailabilityList, loading, saving, fetchUnavailability, createUnavailability, deleteUnavailability }
  = useStaffUnavailability()

const { facilities, fetchFacilities } = useStaffFacilities()

const form = ref({
  facility_id: '',
  start_date: '',
  start_time: '09:00',
  end_date: '',
  end_time: '17:00',
  reason: '',
})

const formErrors = ref({})
const showForm = ref(false)

function todayStr() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const minDate = computed(() => todayStr())

function validateForm() {
  const errs = {}
  if (!form.value.facility_id) errs.facility_id = 'Required'
  if (!form.value.start_date) errs.start_date = 'Required'
  if (!form.value.start_time) errs.start_time = 'Required'
  if (!form.value.end_date) errs.end_date = 'Required'
  if (!form.value.end_time) errs.end_time = 'Required'
  if (form.value.start_date && form.value.end_date) {
    if (form.value.end_date < form.value.start_date) errs.end_date = 'End must be after start'
    else if (form.value.end_date === form.value.start_date && form.value.start_time && form.value.end_time && form.value.end_time <= form.value.start_time) errs.end_time = 'End time must be after start time'
  }
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

function resetForm() {
  form.value = { facility_id: '', start_date: '', start_time: '09:00', end_date: '', end_time: '17:00', reason: '' }
  formErrors.value = {}
  showForm.value = false
}

function facilityName(uuid) {
  const f = facilities.value.find(f => (f.uuid || f.id) === uuid)
  return f ? f.name : ''
}

async function handleSubmit() {
  if (!validateForm()) return
  const result = await createUnavailability({
    facility_id: form.value.facility_id,
    start_at: `${form.value.start_date} ${form.value.start_time}`,
    end_at: `${form.value.end_date} ${form.value.end_time}`,
    reason: form.value.reason || undefined,
  })
  if (result.success) resetForm()
}

async function handleDelete(id) {
  await deleteUnavailability(id)
}

function formatDateTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

onMounted(() => {
  fetchUnavailability()
  fetchFacilities()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Unavailability Form -->
    <div class="card-base p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('schedule.unavailabilityTitle') }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('schedule.unavailabilityDescription') }}</p>
        </div>
        <button
          class="btn-secondary text-sm"
          @click="showForm = !showForm"
        >
          <span class="material-symbols-outlined text-lg">{{ showForm ? 'close' : 'block' }}</span>
          {{ showForm ? 'Cancel' : t('schedule.blockTime') }}
        </button>
      </div>

      <form v-if="showForm" @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.facility') }} <span class="text-rose-400">*</span></label>
          <select class="input-base" v-model="form.facility_id" :class="formErrors.facility_id ? 'border-rose-400' : ''">
            <option value="">{{ t('schedule.selectFacility') }}</option>
            <option v-for="f in facilities" :key="f.uuid || f.id" :value="f.uuid || f.id">
              {{ f.name }}
            </option>
          </select>
          <p v-if="formErrors.facility_id" class="text-xs text-rose-500 font-semibold">{{ formErrors.facility_id }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.startDate') }} <span class="text-rose-400">*</span></label>
            <input
              type="date"
              class="input-base"
              v-model="form.start_date"
              :min="minDate"
              :class="formErrors.start_date ? 'border-rose-400' : ''"
            />
            <p v-if="formErrors.start_date" class="text-xs text-rose-500 font-semibold">{{ formErrors.start_date }}</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.startTime') }} <span class="text-rose-400">*</span></label>
            <input
              type="time"
              class="input-base"
              v-model="form.start_time"
              :class="formErrors.start_time ? 'border-rose-400' : ''"
            />
            <p v-if="formErrors.start_time" class="text-xs text-rose-500 font-semibold">{{ formErrors.start_time }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.endDate') }} <span class="text-rose-400">*</span></label>
            <input
              type="date"
              class="input-base"
              v-model="form.end_date"
              :min="form.start_date || minDate"
              :class="formErrors.end_date ? 'border-rose-400' : ''"
            />
            <p v-if="formErrors.end_date" class="text-xs text-rose-500 font-semibold">{{ formErrors.end_date }}</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.endTime') }} <span class="text-rose-400">*</span></label>
            <input
              type="time"
              class="input-base"
              v-model="form.end_time"
              :class="formErrors.end_time ? 'border-rose-400' : ''"
            />
            <p v-if="formErrors.end_time" class="text-xs text-rose-500 font-semibold">{{ formErrors.end_time }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ t('schedule.reason') }}</label>
          <input
            type="text"
            class="input-base"
            v-model="form.reason"
            :placeholder="t('schedule.reasonPlaceholder')"
          />
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
            {{ t('schedule.blockTime') }}
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
          <p class="text-xs text-slate-500 dark:text-slate-400">Click <strong>Block Time</strong> to mark unavailability</p>
        </div>
      </div>
    </div>

    <!-- Unavailability List -->
    <div>
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="skeleton-shimmer h-16 rounded-xl"></div>
      </div>

      <div v-else-if="unavailabilityList.length === 0" class="empty-state py-10">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined empty-state-icon-svg">event_busy</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('schedule.noUnavailability') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('schedule.noUnavailabilityDesc') }}</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in unavailabilityList"
          :key="item.id || item.uuid"
          class="card-base flex items-center justify-between gap-3 px-4 py-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="shrink-0 w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-lg text-red-500">block</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {{ formatDateTime(item.start_at || item.startAt) }} – {{ formatDateTime(item.end_at || item.endAt) }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span v-if="item.facility_id || item.facility_name" class="text-slate-400">{{ item.facility_name || facilityName(item.facility_id) }}</span>
                <span v-if="item.reason" class="ml-1.5 text-slate-400">· {{ item.reason }}</span>
              </p>
            </div>
          </div>
          <button
            class="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer"
            :title="t('common.delete') || 'Delete'"
            @click="handleDelete(item.id || item.uuid)"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
