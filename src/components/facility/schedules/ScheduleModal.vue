<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

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
  days_of_week: [],
  start_time: '09:00',
  end_time: '17:00',
  slot_duration: 30,
  is_active: true,
})

const errors = ref({})
const staffSearch = ref('')
const staffOpen = ref(false)

const allDays = [
  { key: 0, label: 'Sunday' },
  { key: 1, label: 'Monday' },
  { key: 2, label: 'Tuesday' },
  { key: 3, label: 'Wednesday' },
  { key: 4, label: 'Thursday' },
  { key: 5, label: 'Friday' },
  { key: 6, label: 'Saturday' },
]

function getStaffLabel(member) {
  const name = member.name || member.staff?.full_name || member.user?.name
  return resolveTranslatedValue(name) || ''
}

const filteredStaff = computed(() => {
  if (!staffSearch.value.trim()) return props.staffList
  const q = staffSearch.value.toLowerCase()
  return props.staffList.filter(s => {
    const name = getStaffLabel(s)
    return name.toLowerCase().includes(q)
  })
})

const selectedName = computed(() => {
  if (!form.value.staff_uuid) return ''
  const m = props.staffList.find(s => (s.uuid || s.facility_staff_uuid) === form.value.staff_uuid)
  if (!m) return ''
  return getStaffLabel(m)
})

watch(() => props.show, (val) => {
  if (!val) return
  errors.value = {}
  staffSearch.value = ''
  if (props.schedule) {
    form.value = {
      staff_uuid: props.schedule.staff_uuid || props.schedule.facility_staff?.staff?.uuid || props.schedule.facility_staff?.uuid || '',
      days_of_week: [...(props.schedule.days_of_week || [])],
      start_time: (props.schedule.start_time || '').slice(0, 5) || '09:00',
      end_time: (props.schedule.end_time || '').slice(0, 5) || '17:00',
      slot_duration: props.schedule.slot_duration || 30,
      is_active: props.schedule.is_active ?? true,
    }
  } else {
    form.value = {
      staff_uuid: '',
      days_of_week: [],
      start_time: '09:00',
      end_time: '17:00',
      slot_duration: 30,
      is_active: true,
    }
  }
})

function toggleDay(day) {
  const idx = form.value.days_of_week.indexOf(day)
  if (idx === -1) form.value.days_of_week.push(day)
  else form.value.days_of_week.splice(idx, 1)
}

function selectStaff(member) {
  form.value.staff_uuid = member.uuid || member.facility_staff_uuid
  staffSearch.value = ''
  staffOpen.value = false
}

function validate() {
  errors.value = {}
  if (!form.value.staff_uuid) errors.value.staff_uuid = 'Staff member is required'
  if (!form.value.days_of_week.length) errors.value.days_of_week = 'At least one day is required'
  if (!form.value.start_time) errors.value.start_time = 'Start time is required'
  if (!form.value.end_time) errors.value.end_time = 'End time is required'
  if (form.value.start_time && form.value.end_time && form.value.start_time >= form.value.end_time) {
    errors.value.end_time = 'End time must be after start time'
  }
  if (!form.value.slot_duration || form.value.slot_duration < 5 || form.value.slot_duration > 240) {
    errors.value.slot_duration = 'Must be between 5 and 240 minutes'
  }
  return !Object.keys(errors.value).length
}

function submit() {
  if (!validate()) return
  emit('submit', { ...form.value })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="emit('close')">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ schedule ? (t('schedules.editSchedule') || 'Edit Schedule') : (t('schedules.createSchedule') || 'Create Schedule') }}
            </h3>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer" @click="emit('close')" aria-label="Close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form @submit.prevent="submit" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-6 overflow-y-auto flex-1 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Staff Member *</label>
                  <div class="relative">
                    <div
                      class="w-full px-3 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-between gap-2 cursor-pointer transition"
                      :class="errors.staff_uuid ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
                      @click="staffOpen = !staffOpen"
                    >
                      <span class="truncate" :class="selectedName ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'">
                        {{ selectedName || 'Select a staff member' }}
                      </span>
                      <svg class="w-4 h-4 shrink-0 text-slate-400 transition" :class="{ 'rotate-180': staffOpen }" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                    </div>
                    <Transition name="dropdown">
                      <div v-if="staffOpen" class="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                        <div class="p-2 border-b border-slate-100 dark:border-slate-700">
                          <input v-model="staffSearch" type="text" placeholder="Search staff..." class="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none" />
                        </div>
                        <div class="max-h-48 overflow-y-auto">
                          <button v-for="member in filteredStaff" :key="member.uuid || member.facility_staff_uuid" type="button" class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" :class="{ 'bg-brand-primary/5 dark:bg-brand-primary/10 font-semibold': (member.uuid || member.facility_staff_uuid) === form.staff_uuid }" @click="selectStaff(member)">
                            {{ getStaffLabel(member) }}
                          </button>
                          <div v-if="!filteredStaff.length" class="px-3 py-4 text-center text-xs text-slate-400">No staff found</div>
                        </div>
                      </div>
                    </Transition>
                  </div>
                  <p v-if="errors.staff_uuid" class="text-xs text-red-500">{{ errors.staff_uuid }}</p>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Days of Week *</label>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="d in allDays"
                      :key="d.key"
                      type="button"
                      class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer"
                      :class="form.days_of_week.includes(d.key)
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50'"
                      @click="toggleDay(d.key)"
                    >
                      {{ d.label.slice(0, 3) }}
                    </button>
                  </div>
                  <p v-if="errors.days_of_week" class="text-xs text-red-500">{{ errors.days_of_week }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Start Time *</label>
                  <input type="time" v-model="form.start_time" class="w-full px-3 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" :class="errors.start_time ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'" />
                  <p v-if="errors.start_time" class="text-xs text-red-500">{{ errors.start_time }}</p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">End Time *</label>
                  <input type="time" v-model="form.end_time" class="w-full px-3 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" :class="errors.end_time ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'" />
                  <p v-if="errors.end_time" class="text-xs text-red-500">{{ errors.end_time }}</p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Slot Duration *</label>
                  <div class="flex items-center gap-2">
                    <input type="number" v-model.number="form.slot_duration" min="5" max="240" class="w-full px-3 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" :class="errors.slot_duration ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'" />
                    <span class="text-xs text-slate-500 dark:text-slate-400 shrink-0">min</span>
                  </div>
                  <p v-if="errors.slot_duration" class="text-xs text-red-500">{{ errors.slot_duration }}</p>
                </div>
              </div>

              <div>
                <button type="button" @click="form.is_active = !form.is_active" class="flex items-center gap-3 px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 transition cursor-pointer hover:border-slate-300 dark:hover:border-slate-600">
                  <div class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out" :class="form.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'">
                    <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" :class="form.is_active ? 'translate-x-5' : 'translate-x-0.5'" />
                  </div>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ form.is_active ? 'Active' : 'Inactive' }}</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
              <button type="button" class="inline-flex items-center justify-center py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="emit('close')">
                {{ t('common.cancel') || 'Cancel' }}
              </button>
              <button type="submit" :disabled="saving" class="inline-flex items-center justify-center py-2 px-5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer">
                <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                {{ schedule ? (t('common.save') || 'Save') : (t('schedules.create') || 'Create Schedule') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
