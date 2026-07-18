<script setup>
import { ref } from 'vue'
import { resolveTranslatedValue } from '@/utils/locale'
import StatusBadge from './StatusBadge.vue'
import ScheduleWeekView from './ScheduleWeekView.vue'

const props = defineProps({
  staffGroup: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete'])

const menuOpen = ref(false)

function getInitial(name) {
  return (name || '?').charAt(0).toUpperCase()
}

function staffName() {
  const raw = props.staffGroup._rawSchedules[0]
  const name = raw?.facility_staff?.staff?.full_name || raw?.facility_staff?.staff?.name
  return resolveTranslatedValue(name) || `Staff #${raw?.facility_staff?.staff?.uuid || raw?.id || ''}`
}

function specialization() {
  const raw = props.staffGroup._rawSchedules[0]
  const spec = raw?.facility_staff?.staff?.specialization
  return spec ? resolveTranslatedValue(spec) : null
}

function experience() {
  const raw = props.staffGroup._rawSchedules[0]
  return raw?.facility_staff?.staff?.years_of_experience
}

function fee() {
  const raw = props.staffGroup._rawSchedules[0]
  return raw?.facility_staff?.staff?.consultation_fee
}

function allActive() {
  return Object.values(props.staffGroup.schedules).every(s => s.is_active)
}

function allInactive() {
  return Object.values(props.staffGroup.schedules).every(s => !s.is_active)
}
</script>

<template>
  <div class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-200 p-5 relative">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0">
          {{ getInitial(staffName()) }}
        </div>
        <div class="min-w-0">
          <h3 class="font-semibold text-slate-900 dark:text-white text-sm truncate">{{ staffName() }}</h3>
          <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            <span v-if="specialization()">{{ specialization() }}</span>
            <span v-if="experience() !== undefined">· {{ experience() }} yrs</span>
            <span v-if="fee()">· ${{ fee() }}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <StatusBadge :active="allActive()" />
        <div class="relative">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            @click="menuOpen = !menuOpen"
            @blur="setTimeout(() => menuOpen = false, 200)"
            aria-label="Actions"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01"/></svg>
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 top-10 z-50 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 overflow-hidden"
          >
            <button class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" @click="emit('edit', staffGroup); menuOpen = false">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              Edit
            </button>
            <button class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer" @click="emit('delete', staffGroup); menuOpen = false">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Schedule -->
    <ScheduleWeekView :schedules="staffGroup.schedules" />

    <!-- Quick edit inline -->
    <div class="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center gap-2">
      <button
        class="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
        @click="emit('edit', staffGroup)"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        Edit
      </button>
      <button
        class="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition flex items-center gap-1.5 cursor-pointer"
        @click="emit('delete', staffGroup)"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        Delete
      </button>
    </div>
  </div>
</template>
