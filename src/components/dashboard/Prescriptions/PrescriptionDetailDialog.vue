<script setup>
import { useI18n } from 'vue-i18n'
import { useFormatDate } from '../../../composables/useFormatDate'
import { resolveTranslatedValue } from '@/utils/locale'

const { t, locale } = useI18n()
const { formatDate } = useFormatDate()

function formatTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleTimeString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

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

const statusStyle = {
  active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
  accepted: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
  pharmacy_selected: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
  dispensed: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/30',
  rejected: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/30',
  cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}

function getStatusStyle(status) {
  return statusStyle[status?.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
}

function getInitials(name) {
  if (!name || name === '—') return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <div
    v-if="show && prescription"
    class="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700/80 animate-slide-up">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('prescriptions.details') || 'Prescription Details' }}</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ prescription.uuid?.slice(0, 12) || '—' }}...</p>
          </div>
        </div>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6">

        <!-- Status Badge Row -->
        <div class="flex items-center justify-between">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
            :class="getStatusStyle(prescription.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="{
              'bg-emerald-500': prescription.status === 'active' || prescription.status === 'accepted',
              'bg-blue-500': prescription.status === 'pharmacy_selected',
              'bg-purple-500': prescription.status === 'dispensed',
              'bg-rose-500': prescription.status === 'rejected' || prescription.status === 'cancelled',
              'bg-amber-500': prescription.status === 'pending',
            }"></span>
            {{ prescription.status || '—' }}
          </span>
        </div>

        <!-- Profile Cards: Patient + Doctor + Facility -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Patient -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{{ t('prescriptions.patient') || 'Patient' }}</p>
            <div class="flex items-center gap-3">
              <div v-if="prescription.patient?.avatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700">
                <img :src="prescription.patient.avatar" :alt="resolveName(prescription.patient)" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-700">
                <span class="text-sm font-bold text-brand-primary">{{ getInitials(resolveName(prescription.patient)) }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveName(prescription.patient) }}</p>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{{ prescription.patient?.uuid?.slice(0, 8) || '' }}</p>
              </div>
            </div>
          </div>

          <!-- Doctor -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{{ t('prescriptions.doctor') || 'Doctor' }}</p>
            <div class="flex items-center gap-3">
              <div v-if="prescription.doctor?.avatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700">
                <img :src="prescription.doctor.avatar" :alt="resolveName(prescription.doctor)" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-700">
                <span class="text-sm font-bold text-purple-600 dark:text-purple-400">{{ getInitials(resolveName(prescription.doctor)) }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveName(prescription.doctor) }}</p>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{{ prescription.doctor?.uuid?.slice(0, 8) || '' }}</p>
              </div>
            </div>
          </div>

          <!-- Facility -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{{ t('prescriptions.facility') || 'Facility' }}</p>
            <div class="flex items-center gap-3">
              <div v-if="prescription.facility?.cover_image" class="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700">
                <img :src="prescription.facility.cover_image" :alt="resolveName(prescription.facility)" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-700">
                <svg class="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveName(prescription.facility) }}</p>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{{ prescription.facility?.uuid?.slice(0, 8) || '' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Appointment Info Grid -->
        <div v-if="prescription.appointment" class="space-y-3">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('prescriptions.appointment') || 'Appointment' }}</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('prescriptions.date') || 'Date' }}</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ formatDate(prescription.appointment.start_at) }}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('prescriptions.time') || 'Time' }}</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ formatTime(prescription.appointment.start_at) }}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('prescriptions.appointmentStatus') || 'Status' }}</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1 capitalize">{{ prescription.appointment.status || '—' }}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('prescriptions.createdAt') || 'Created' }}</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ formatDate(prescription.created_at || prescription.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Medicines -->
        <div v-if="prescription.items?.length" class="space-y-3">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('prescriptions.medicines') || 'Medicines' }} ({{ prescription.items.length }})</h4>
          <div class="space-y-2">
            <div
              v-for="(item, i) in prescription.items"
              :key="item.id || i"
              class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50"
            >
              <div class="flex items-start gap-3">
                <div v-if="item.medicine?.image_url" class="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700">
                  <img :src="item.medicine.image_url" :alt="resolveName(item.medicine)" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-10 h-10 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-700">
                  <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveName(item.medicine) }}</p>
                  <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs">
                    <div v-if="item.dosage">
                      <span class="text-slate-400 dark:text-slate-500">{{ t('prescriptions.dosage') || 'Dosage' }}:</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-300 ml-1">{{ item.dosage }}</span>
                    </div>
                    <div v-if="item.frequency">
                      <span class="text-slate-400 dark:text-slate-500">{{ t('prescriptions.frequency') || 'Frequency' }}:</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-300 ml-1">{{ item.frequency }}</span>
                    </div>
                    <div v-if="item.duration">
                      <span class="text-slate-400 dark:text-slate-500">{{ t('prescriptions.duration') || 'Duration' }}:</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-300 ml-1">{{ item.duration }}</span>
                    </div>
                    <div v-if="item.route">
                      <span class="text-slate-400 dark:text-slate-500">{{ t('prescriptions.route') || 'Route' }}:</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-300 ml-1">{{ item.route }}</span>
                    </div>
                  </div>
                  <p v-if="item.instructions" class="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                    {{ item.instructions }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="prescription.notes" class="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
          <p class="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">{{ t('prescriptions.notes') || 'Notes' }}</p>
          <p class="text-sm text-amber-800 dark:text-amber-300 italic">"{{ prescription.notes }}"</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          @click="emit('close')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
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
