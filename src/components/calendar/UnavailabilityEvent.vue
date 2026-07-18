<script setup>
import { computed } from 'vue'

const props = defineProps({
  unavailability: { type: Object, required: true },
  position: { type: Object, required: true },
})

const emit = defineEmits(['click'])

const statusStyles = computed(() => {
  const s = props.unavailability.status
  if (s === 'approved') return { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
  if (s === 'pending') return { bg: 'bg-yellow-400/15', border: 'border-yellow-400/40', text: 'text-yellow-700 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }
  if (s === 'rejected') return { bg: 'bg-slate-400/15', border: 'border-slate-400/40', text: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' }
  return { bg: 'bg-slate-300/15', border: 'border-slate-300/40', text: 'text-slate-500 dark:text-slate-500', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-500' }
})
</script>

<template>
  <div
    class="absolute left-0.5 right-0.5 rounded-md px-2 py-1 cursor-pointer transition-all duration-150 hover:brightness-95 hover:shadow-md overflow-hidden border"
    :class="[statusStyles.bg, statusStyles.border]"
    :style="{
      top: position.top + 'px',
      height: position.height + 'px',
    }"
    @click.stop="emit('click', unavailability)"
  >
    <div class="font-semibold text-[11px] leading-tight truncate" :class="statusStyles.text">
      {{ unavailability.reason || 'Unavailable' }}
    </div>
    <div class="flex items-center gap-1.5">
      <span class="text-[10px] text-slate-500 dark:text-slate-400">
        {{ new Date(unavailability.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
        -
        {{ new Date(unavailability.end_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
      </span>
      <span class="text-[9px] font-semibold px-1 py-0.5 rounded" :class="statusStyles.badge">
        {{ unavailability.status }}
      </span>
    </div>
  </div>
</template>
