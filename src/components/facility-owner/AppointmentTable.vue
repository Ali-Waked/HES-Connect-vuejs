<script setup>
defineProps({
  appointments: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})

const statusStyles = {
  confirmed: 'bg-blue-100/30 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'in-progress': 'bg-amber-100/30 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-green-100/30 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100/30 text-red-700 dark:bg-red-900/30 dark:text-red-300'
}

function statusLabel(s) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
</script>

<template>
  <div class="card-base overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-brand-primary text-lg">event_note</span>
        Live Appointments
      </h3>
      <span class="text-xs font-semibold text-slate-400">{{ appointments.length }} today</span>
    </div>

    <div v-if="loading" class="divide-y divide-slate-100 dark:divide-slate-700">
      <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-5 py-3.5">
        <div class="w-12 h-4 skeleton-shimmer rounded"></div>
        <div class="w-28 h-4 skeleton-shimmer rounded"></div>
        <div class="w-24 h-4 skeleton-shimmer rounded"></div>
        <div class="w-16 h-5 skeleton-shimmer rounded-full"></div>
      </div>
    </div>

    <div v-else-if="appointments.length === 0" class="empty-state py-10">
      <div class="empty-state-icon">
        <span class="material-symbols-outlined empty-state-icon-svg">calendar_today</span>
      </div>
      <p class="text-sm font-semibold text-slate-500">No appointments today</p>
    </div>

    <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
      <div v-for="apt in appointments" :key="apt.id" class="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 w-12 shrink-0">{{ apt.time }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ apt.doctor }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ apt.patient }}</p>
        </div>
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" :class="statusStyles[apt.status] || 'bg-slate-100 text-slate-600'">
          {{ statusLabel(apt.status) }}
        </span>
        <button class="text-xs font-bold text-brand-primary hover:text-brand-primary-hover shrink-0 transition-colors" title="View appointment">
          <span class="material-symbols-outlined text-lg">open_in_new</span>
        </button>
      </div>
    </div>
  </div>
</template>
