<script setup>
import { useI18n } from 'vue-i18n'
import { useFormatDate } from '../../../composables/useFormatDate'
import { resolveTranslatedValue } from '@/utils/locale'

const { t, locale } = useI18n()
const { formatDate } = useFormatDate()

defineProps({
  show: { type: Boolean, required: true },
  prescription: { type: Object, default: null }
})

const emit = defineEmits(['close'])

function resolveName(objOrStr) {
  if (!objOrStr) return '—'
  if (typeof objOrStr === 'string') return objOrStr
  return resolveTranslatedValue(objOrStr.name || objOrStr, locale.value) || '—'
}

const statusVariant = {
  active: 'bg-emerald-100/30 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  pharmacy_selected: 'bg-blue-100/30 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  accepted: 'bg-emerald-100/30 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  dispensed: 'bg-purple-100/30 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  rejected: 'bg-rose-100/30 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
  cancelled: 'bg-slate-100/30 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300',
}

function getStatusClass(status) {
  return statusVariant[status?.toLowerCase()] || 'bg-slate-100/30 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
}
</script>

<template>
  <div
    v-if="show && prescription"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('prescriptions.details') || 'Prescription Details' }}</h3>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-5 overflow-y-auto flex-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('prescriptions.uuid') || 'UUID' }}</p>
            <p class="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">{{ prescription.uuid || prescription.id || '—' }}</p>
          </div>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            :class="getStatusClass(prescription.status)"
          >
            {{ prescription.status || '—' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('prescriptions.patient') || 'Patient' }}</p>
            <div class="flex items-center gap-2">
              <div v-if="prescription.patient?.avatar" class="w-7 h-7 rounded-full overflow-hidden shrink-0">
                <img :src="prescription.patient.avatar" :alt="prescription.patient?.name || ''" class="w-full h-full object-cover" />
              </div>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(prescription.patient) }}</p>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('prescriptions.pharmacist') || 'Pharmacist' }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(prescription.pharmacist) }}</p>
          </div>
        </div>

        <div v-if="prescription.pharmacy" class="space-y-1">
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('prescriptions.pharmacy') || 'Pharmacy' }}</p>
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveName(prescription.pharmacy) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('prescriptions.createdAt') || 'Created At' }}</p>
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDate(prescription.created_at || prescription.createdAt) }}</p>
        </div>

        <div v-if="prescription.notes" class="space-y-1">
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('prescriptions.notes') || 'Notes' }}</p>
          <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 italic">
            "{{ prescription.notes }}"
          </div>
        </div>
      </div>

      <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
        <button
          type="button"
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          @click="emit('close')"
        >
          {{ t('common.close') || 'Close' }}
        </button>
      </div>
    </div>
  </div>
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
