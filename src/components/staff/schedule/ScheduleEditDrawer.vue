<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: { type: Boolean, default: false },
  schedule: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save', 'toggle', 'delete'])

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
const confirmDelete = ref(false)

watch(() => props.show, (val) => {
  if (val && props.schedule) {
    dayOfWeek.value = String(props.schedule.day_of_week ?? props.schedule.dayOfWeek ?? '')
    startTime.value = props.schedule.start_time || props.schedule.startTime || ''
    endTime.value = props.schedule.end_time || props.schedule.endTime || ''
    slotDuration.value = props.schedule.slot_duration || props.schedule.slotDuration || 30
    isActive.value = props.schedule.is_active !== false
    formError.value = ''
    confirmDelete.value = false
  }
})

const scheduleTitle = computed(() => {
  const day = props.schedule
  if (!day) return ''
  const time = `${formatTime(startTime.value || day.start_time || day.startTime)} – ${formatTime(endTime.value || day.end_time || day.endTime)}`
  return time
})

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

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

function handleToggle() {
  if (!props.schedule) return
  emit('toggle', props.schedule.id, !isActive.value)
}

function handleDelete() {
  if (!props.schedule) return
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  emit('delete', props.schedule.id)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" @click="$emit('close')"></div>
      <div
        class="relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 h-full overflow-y-auto animate-slide-in-right"
        :class="locale === 'ar' ? 'border-l-0 border-r' : ''"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-slate-800 z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition" @click="$emit('close')">
              <span class="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('schedule.editSchedule') }}</h3>
              <p v-if="scheduleTitle" class="text-xs text-slate-500 dark:text-slate-400">{{ scheduleTitle }}</p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <form @submit.prevent="submit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{{ t('schedule.daysOfWeek') }}</label>
            <select v-model="dayOfWeek" class="input-base" required>
              <option value="" disabled>{{ t('common.select') }}</option>
              <option v-for="day in weekDays" :key="day.value" :value="day.value">
                {{ locale === 'ar' ? day.label_ar : day.label_en }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{{ t('schedule.startTime') }}</label>
              <input v-model="startTime" type="time" class="input-base" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{{ t('schedule.endTime') }}</label>
              <input v-model="endTime" type="time" class="input-base" required />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{{ t('schedule.slotDuration') }} ({{ t('schedule.minutes') }})</label>
            <input v-model.number="slotDuration" type="number" min="5" step="5" class="input-base" required />
          </div>

          <div class="flex items-center gap-3 pt-1">
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="isActive" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-5.5 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ isActive ? t('schedule.active') : t('schedule.inactive') }}</span>
          </div>

          <p v-if="formError" class="text-xs text-red-500 font-medium">{{ formError }}</p>

          <!-- Action Buttons -->
          <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div class="flex gap-3">
              <button type="submit" :disabled="saving" class="btn-primary flex-1">
                <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined text-lg">save</span>
                {{ t('common.save') }}
              </button>
              <button
                type="button"
                class="btn-secondary flex-1"
                :class="isActive ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'"
                @click="handleToggle"
              >
                <span class="material-symbols-outlined text-lg">{{ isActive ? 'pause_circle' : 'play_circle' }}</span>
                {{ isActive ? t('schedule.inactive') : t('schedule.active') }}
              </button>
            </div>
            <button
              type="button"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-red-200 dark:border-red-800"
              @click="handleDelete"
            >
              <span class="material-symbols-outlined text-lg">{{ confirmDelete ? 'warning' : 'delete' }}</span>
              {{ confirmDelete ? t('common.confirm') : t('common.delete') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
