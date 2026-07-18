<script setup>
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

const props = defineProps({
  show: { type: Boolean, required: true },
  schedule: { type: Object, default: null },
  deleting: { type: Boolean, default: false },
})

defineEmits(['confirm', 'close'])

const { t, locale } = useI18n()

const dayMap = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday',
}

function staffName() {
  if (!props.schedule) return ''
  const raw = props.schedule
  const name = raw.facility_staff?.staff?.full_name || raw.facility_staff?.staff?.name
  return resolveTranslatedValue(name) || `Staff #${raw.facility_staff?.staff?.uuid || raw.id || ''}`
}

function scheduleSummary() {
  if (!props.schedule) return ''
  const d = dayMap[props.schedule.day_of_week]
  if (!d) return ''
  const start = (props.schedule.start_time || '').slice(0, 5) || '?'
  const end = (props.schedule.end_time || '').slice(0, 5) || '?'
  return `${d}, ${start} – ${end}, ${props.schedule.slot_duration || '?'}min`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="emit('close')">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="p-6">
            <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ t('schedules.deleteTitle') || 'Delete Schedule?' }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              This action cannot be undone. The following schedule will be permanently removed:
            </p>
            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-slate-500 dark:text-slate-400 font-medium w-20">Staff:</span>
                <span class="font-semibold text-slate-900 dark:text-white">{{ staffName() }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-slate-500 dark:text-slate-400 font-medium w-20">Schedule:</span>
                <span class="text-slate-700 dark:text-slate-300">{{ scheduleSummary() }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <button type="button" class="inline-flex items-center justify-center py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="emit('close')">
              {{ t('common.cancel') || 'Cancel' }}
            </button>
            <button type="button" :disabled="deleting" class="inline-flex items-center justify-center py-2 px-5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-red-500/15 transition cursor-pointer" @click="emit('confirm')">
              <svg v-if="deleting" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              {{ t('common.delete') || 'Delete' }}
            </button>
          </div>
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
</style>
