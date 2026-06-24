<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: { type: Boolean, default: false },
  initialDay: { type: Number, default: null },
})

const emit = defineEmits(['close', 'save'])

const { t, locale } = useI18n()

const weekDays = [
  { value: 0, label_en: 'Sunday', label_ar: 'الأحد' },
  { value: 1, label_en: 'Monday', label_ar: 'الإثنين' },
  { value: 2, label_en: 'Tuesday', label_ar: 'الثلاثاء' },
  { value: 3, label_en: 'Wednesday', label_ar: 'الأربعاء' },
  { value: 4, label_en: 'Thursday', label_ar: 'الخميس' },
  { value: 5, label_en: 'Friday', label_ar: 'الجمعة' },
  { value: 6, label_en: 'Saturday', label_ar: 'السبت' },
]

const dayOfWeek = ref('')
const startTime = ref('')
const endTime = ref('')
const slotDuration = ref(30)
const isActive = ref(true)
const formError = ref('')

watch(() => props.show, (val) => {
  if (val) {
    dayOfWeek.value = props.initialDay !== null ? String(props.initialDay) : ''
    startTime.value = ''
    endTime.value = ''
    slotDuration.value = 30
    isActive.value = true
    formError.value = ''
  }
})

function submit() {
  formError.value = ''
  if (!dayOfWeek.value || !startTime.value || !endTime.value) {
    formError.value = 'All fields are required'
    return
  }
  if (startTime.value >= endTime.value) {
    formError.value = 'End time must be after start time'
    return
  }
  emit('save', {
    day_of_week: Number(dayOfWeek.value),
    start_time: startTime.value,
    end_time: endTime.value,
    slot_duration: slotDuration.value,
    is_active: isActive.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-in overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Create Schedule</h3>
          <button class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition" @click="$emit('close')">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <form @submit.prevent="submit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Day of Week</label>
            <select
              v-model="dayOfWeek"
              class="input-base"
              required
            >
              <option value="" disabled>Select day</option>
              <option v-for="day in weekDays" :key="day.value" :value="day.value">
                {{ locale === 'ar' ? day.label_ar : day.label_en }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start Time</label>
              <input v-model="startTime" type="time" class="input-base" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">End Time</label>
              <input v-model="endTime" type="time" class="input-base" required />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Slot Duration (minutes)</label>
            <input
              v-model.number="slotDuration"
              type="number"
              min="5"
              step="5"
              class="input-base"
              required
            />
            <p class="text-[11px] text-slate-400 mt-1">Duration of each appointment slot</p>
          </div>
          <div class="flex items-center gap-3 pt-1">
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="isActive" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-5.5 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
          </div>
          <p v-if="formError" class="text-xs text-red-500 font-medium">{{ formError }}</p>
          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn-primary">
              <span class="material-symbols-outlined text-lg">save</span>
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
