<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  event: { type: Object, default: null },
  type: { type: String, default: 'schedule' },
})

const emit = defineEmits(['close'])

const facilityColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

const color = computed(() => {
  if (props.type === 'unavailability') {
    const s = props.event?.status
    if (s === 'approved') return '#EF4444'
    if (s === 'pending') return '#EAB308'
    return '#94A3B8'
  }
  return '#3B82F6'
})

const statusBadge = computed(() => {
  const s = props.event?.status
  if (s === 'approved') return { label: 'Approved', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  if (s === 'pending') return { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' }
  if (s === 'rejected') return { label: 'Rejected', class: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
  return null
})

function formatTime(t) {
  if (!t) return ''
  if (t.includes('T')) {
    return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  return t
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && event"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
      @click.self="emit('close')"
    >
      <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[400px] shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up">
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ type === 'schedule' ? 'Schedule Details' : 'Unavailability Details' }}
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Schedule details -->
          <template v-if="type === 'schedule'">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: color + '20' }">
                <svg class="w-5 h-5" :style="{ color }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-slate-900 dark:text-white">{{ event.facility?.name || 'Schedule' }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ event.start_time }} - {{ event.end_time }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Day</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][event.day_of_week] || '—' }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</p>
                <p class="text-sm font-semibold mt-0.5" :class="event.is_active ? 'text-emerald-600' : 'text-slate-500'">
                  {{ event.is_active ? 'Active' : 'Inactive' }}
                </p>
              </div>
            </div>
          </template>

          <!-- Unavailability details -->
          <template v-else>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: color + '20' }">
                <svg class="w-5 h-5" :style="{ color }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-slate-900 dark:text-white">{{ event.reason || 'Unavailable' }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ formatTime(event.start_at) }} - {{ formatTime(event.end_at) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ formatDate(event.start_at) }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</p>
                <span v-if="statusBadge" class="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full mt-1" :class="statusBadge.class">
                  {{ statusBadge.label }}
                </span>
              </div>
            </div>
          </template>
        </div>

        <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            class="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
