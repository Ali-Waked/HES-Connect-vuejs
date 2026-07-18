<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: { type: Boolean, required: true },
  schedule: { type: Object, default: null },
  staffList: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])

const { t } = useI18n()

const form = ref({
  staff_uuid: '',
  working_days: [],
  start_time: '09:00',
  end_time: '17:00',
  slot_duration: 30,
  is_active: true,
})

const errors = ref({})
const staffSearch = ref('')
const staffDropdownOpen = ref(false)

const allDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const dayLabels = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' }

const filteredStaff = computed(() => {
  if (!staffSearch.value.trim()) return props.staffList
  const q = staffSearch.value.toLowerCase()
  return props.staffList.filter(s => {
    const name = s.user?.name || s.name || ''
    if (typeof name === 'string') return name.toLowerCase().includes(q)
    return (name.en || name.ar || '').toLowerCase().includes(q)
  })
})

const selectedStaffName = computed(() => {
  if (!form.value.staff_uuid) return ''
  const member = props.staffList.find(s => (s.uuid || s.facility_staff_uuid) === form.value.staff_uuid)
  if (!member) return ''
  const name = member.user?.name || member.name
  if (typeof name === 'string') return name
  return name?.en || name?.ar || ''
})

watch(() => props.show, (val) => {
  if (val) {
    errors.value = {}
    staffSearch.value = ''
    if (props.schedule) {
      form.value = {
        staff_uuid: props.schedule.staff_uuid || props.schedule.staff?.uuid || '',
        working_days: [...(props.schedule.working_days || [])],
        start_time: props.schedule.start_time || '09:00',
        end_time: props.schedule.end_time || '17:00',
        slot_duration: props.schedule.slot_duration || 30,
        is_active: props.schedule.is_active ?? true,
      }
    } else {
      form.value = {
        staff_uuid: '',
        working_days: [],
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 30,
        is_active: true,
      }
    }
  }
})

function toggleDay(day) {
  const idx = form.value.working_days.indexOf(day)
  if (idx === -1) {
    form.value.working_days.push(day)
  } else {
    form.value.working_days.splice(idx, 1)
  }
}

function selectStaff(member) {
  form.value.staff_uuid = member.uuid || member.facility_staff_uuid
  staffSearch.value = ''
  staffDropdownOpen.value = false
}

function validate() {
  errors.value = {}
  if (!form.value.staff_uuid) errors.value.staff_uuid = 'Staff member is required'
  if (form.value.working_days.length === 0) errors.value.working_days = 'At least one day is required'
  if (!form.value.start_time) errors.value.start_time = 'Start time is required'
  if (!form.value.end_time) errors.value.end_time = 'End time is required'
  if (form.value.start_time && form.value.end_time && form.value.start_time >= form.value.end_time) {
    errors.value.end_time = 'End time must be after start time'
  }
  if (!form.value.slot_duration || form.value.slot_duration < 5 || form.value.slot_duration > 240) {
    errors.value.slot_duration = 'Slot duration must be between 5 and 240 minutes'
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', { ...form.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
      <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
        <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ schedule ? (t('schedules.editSchedule') || 'Edit Staff Schedule') : (t('schedules.createSchedule') || 'Create Staff Schedule') }}
          </h3>
          <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" @click="$emit('close')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col flex-1 overflow-hidden">
          <div class="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
            <!-- Staff Select -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Staff Member *</label>
              <div class="relative">
                <div
                  class="w-full p-2.5 text-sm border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-between gap-2 cursor-pointer transition"
                  :class="errors.staff_uuid ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
                  @click="staffDropdownOpen = !staffDropdownOpen"
                >
                  <span v-if="selectedStaffName" class="truncate">{{ selectedStaffName }}</span>
                  <span v-else class="text-slate-400 dark:text-slate-500">Select a staff member</span>
                  <svg class="w-4 h-4 shrink-0 text-slate-400 transition" :class="{ 'rotate-180': staffDropdownOpen }" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </div>
                <div v-if="staffDropdownOpen" class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <div class="p-2 border-b border-slate-100 dark:border-slate-700">
                    <input v-model="staffSearch" type="text" placeholder="Search staff..." class="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none" />
                  </div>
                  <div class="max-h-48 overflow-y-auto">
                    <button v-for="member in filteredStaff" :key="member.uuid || member.facility_staff_uuid" type="button" class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" :class="{ 'bg-brand-primary/5 dark:bg-brand-primary/10 font-semibold': (member.uuid || member.facility_staff_uuid) === form.staff_uuid }" @click="selectStaff(member)">
                      {{ member.user?.name || member.name }}
                    </button>
                    <div v-if="!filteredStaff.length" class="px-3 py-4 text-center text-xs text-slate-400">No staff found</div>
                  </div>
                </div>
              </div>
              <p v-if="errors.staff_uuid" class="text-xs text-red-500">{{ errors.staff_uuid }}</p>
            </div>

            <!-- Working Days -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Working Days *</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="day in allDays"
                  :key="day"
                  type="button"
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer"
                  :class="form.working_days.includes(day)
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50'"
                  @click="toggleDay(day)"
                >
                  {{ dayLabels[day] }}
                </button>
              </div>
              <p v-if="errors.working_days" class="text-xs text-red-500">{{ errors.working_days }}</p>
            </div>

            <!-- Working Hours -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Start Time *</label>
                <input type="time" v-model="form.start_time" class="w-full p-2.5 text-sm border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" :class="errors.start_time ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'" />
                <p v-if="errors.start_time" class="text-xs text-red-500">{{ errors.start_time }}</p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">End Time *</label>
                <input type="time" v-model="form.end_time" class="w-full p-2.5 text-sm border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" :class="errors.end_time ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'" />
                <p v-if="errors.end_time" class="text-xs text-red-500">{{ errors.end_time }}</p>
              </div>
            </div>

            <!-- Slot Duration & Status -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Slot Duration *</label>
                <div class="flex items-center gap-2">
                  <input type="number" v-model.number="form.slot_duration" min="5" max="240" class="w-full p-2.5 text-sm border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" :class="errors.slot_duration ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'" />
                  <span class="text-xs text-slate-500 dark:text-slate-400 shrink-0">min</span>
                </div>
                <p v-if="errors.slot_duration" class="text-xs text-red-500">{{ errors.slot_duration }}</p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
                <button type="button" @click="form.is_active = !form.is_active" class="flex items-center gap-3 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 transition cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 mt-0.5">
                  <div class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out" :class="form.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'">
                    <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" :class="form.is_active ? 'translate-x-5' : 'translate-x-0.5'" />
                  </div>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ form.is_active ? 'Active' : 'Inactive' }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" :disabled="saving" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer">
              <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              {{ schedule ? t('common.save') : (t('schedules.create') || 'Create Schedule') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
