<template>
  <StaffModalShell :show="show" title="Add Schedule Slot" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Day of Week</label>
        <select v-model="dayOfWeek" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required>
          <option value="" disabled>Select day</option>
          <option v-for="(name, i) in days" :key="i" :value="i">{{ name }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
          <input type="time" v-model="startTime" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">End Time</label>
          <input type="time" v-model="endTime" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Slot Duration (minutes)</label>
        <input type="number" v-model.number="slotDuration" min="5" step="5" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
      </div>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300" @click="$emit('close')">Cancel</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">Add Slot</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'

defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const store = useStaffStore()
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const dayOfWeek = ref('')
const startTime = ref('')
const endTime = ref('')
const slotDuration = ref(30)
const error = ref('')

function submit() {
  if (!dayOfWeek.value || !startTime.value || !endTime.value) { error.value = 'All fields required'; return }
  if (startTime.value >= endTime.value) { error.value = 'End time must be after start time'; return }
  store.addScheduleSlot({ dayOfWeek: Number(dayOfWeek.value), startTime: startTime.value, endTime: endTime.value, slotDuration: slotDuration.value })
  store.showToast('Slot added', 'success')
  emit('close')
}
</script>
