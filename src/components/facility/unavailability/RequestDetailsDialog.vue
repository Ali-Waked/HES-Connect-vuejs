<script setup>
import { useI18n } from 'vue-i18n'
import StatusBadge from './StatusBadge.vue'
import { useFormatDate } from '@/composables/useFormatDate'

defineProps({
  show: { type: Boolean, required: true },
  request: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'approve', 'reject'])

const { t } = useI18n()
const { formatDate } = useFormatDate()

function getStaffName(staff) {
  if (!staff) return '—'
  const name = staff.user?.name || staff.name
  if (!name) return '—'
  if (typeof name === 'string') return name
  return name.en || name.ar || '—'
}

function getStaffAvatar(staff) {
  return staff?.user?.avatar || staff?.avatar || null
}

function getStaffDepartment(staff) {
  if (!staff) return ''
  const dept = staff.facilities?.[0]?.department?.name || staff.department?.name
  if (!dept) return ''
  if (typeof dept === 'string') return dept
  return dept.en || dept.ar || ''
}

function getStaffPosition(staff) {
  if (!staff) return ''
  const pos = staff.facilities?.[0]?.role?.name || staff.position?.name
  if (!pos) return ''
  if (typeof pos === 'string') return pos
  return pos.en || pos.ar || ''
}

function formatPeriod(startDate, endDate) {
  if (!startDate || !endDate) return '—'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const opts = { year: 'numeric', month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`
}

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return ''
  return `${startTime} - ${endTime}`
}

function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return '—'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10
  if (diffHours < 24) return `${diffHours} Hours`
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24) * 10) / 10
  return `${diffDays} Days`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
      <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
        <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Request Details</h3>
          <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" @click="$emit('close')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div v-if="request" class="p-6 overflow-y-auto flex-1 space-y-6">
          <!-- Staff Profile -->
          <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <img v-if="getStaffAvatar(request.staff)" :src="getStaffAvatar(request.staff)" class="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" />
            <div v-else class="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-lg font-bold text-brand-primary">
              {{ getStaffName(request.staff).charAt(0) }}
            </div>
            <div>
              <h4 class="text-base font-bold text-slate-900 dark:text-white">{{ getStaffName(request.staff) }}</h4>
              <p v-if="getStaffDepartment(request.staff)" class="text-sm text-slate-500 dark:text-slate-400">{{ getStaffDepartment(request.staff) }}</p>
              <p v-if="getStaffPosition(request.staff)" class="text-xs text-brand-primary font-medium">{{ getStaffPosition(request.staff) }}</p>
            </div>
          </div>

          <!-- Unavailable Period -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unavailable Period</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date Range</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ formatPeriod(request.start_date, request.end_date) }}</p>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Time</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ formatTimeRange(request.start_time, request.end_time) || 'All Day' }}</p>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Duration</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ calculateDuration(request.start_date, request.end_date) }}</p>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</p>
                <div class="mt-1"><StatusBadge :status="request.status" /></div>
              </div>
            </div>
          </div>

          <!-- Reason -->
          <div v-if="request.reason" class="space-y-2">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</h4>
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ request.reason }}</p>
            </div>
          </div>

          <!-- Review Notes (if rejected) -->
          <div v-if="request.review_notes" class="space-y-2">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Review Notes</h4>
            <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
              <p class="text-sm text-red-700 dark:text-red-400 leading-relaxed">{{ request.review_notes }}</p>
            </div>
          </div>

          <!-- Metadata -->
          <div class="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <div class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Submitted {{ timeAgo(request.created_at) }}
            </div>
          </div>
        </div>

        <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button type="button" v-if="request?.status === 'pending'" class="inline-flex items-center justify-center gap-1.5 py-2 px-4.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer" @click="$emit('reject')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
            Reject
          </button>
          <button type="button" v-if="request?.status === 'pending'" class="inline-flex items-center justify-center gap-1.5 py-2 px-4.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white shadow-md shadow-emerald-500/15 transition cursor-pointer" @click="$emit('approve')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            Approve
          </button>
          <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">
            {{ t('common.close') }}
          </button>
        </div>
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
