<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">My Schedule</h2>
        <p class="text-sm text-slate-500">Weekly slots and blocked dates</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700" @click="blockModal = true">Block Date</button>
        <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="slotModal = true">+ Add Slot</button>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-64 w-full animate-pulse rounded-xl bg-slate-100"></div>
    </div>

    <template v-else>
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Weekly View</h3>
        <div class="grid grid-cols-7 gap-2">
          <div v-for="(day, i) in dayNames" :key="i" class="rounded-lg border border-slate-100 p-3 min-h-[120px]">
            <div class="text-center border-b border-slate-100 pb-2 mb-2">
              <p class="text-xs font-bold text-slate-500 uppercase">{{ day }}</p>
            </div>
            <div v-for="slot in getSlotsForDay(i)" :key="slot.id" class="mb-2 rounded-md bg-brand-primary/10 p-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-brand-primary">{{ slot.startTime }}–{{ slot.endTime }}</span>
                <button class="text-red-400 hover:text-red-600" @click="confirmDeleteSlot(slot)">✕</button>
              </div>
              <span class="text-slate-500">{{ slot.slotDuration }}min</span>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Unavailable Dates</h3>
            <p class="text-sm text-slate-500">Blocked days</p>
          </div>
        </div>
        <div v-if="store.unavailableDates.length" class="space-y-2">
          <div v-for="d in store.unavailableDates" :key="d.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
            <div>
              <span class="font-semibold text-slate-900">{{ d.date }}</span>
              <span class="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{{ d.reason }}</span>
            </div>
            <button class="text-red-400 hover:text-red-600 text-sm" @click="confirmDeleteDate(d)">✕</button>
          </div>
        </div>
        <div v-else class="py-6 text-center text-sm text-slate-500">No unavailable dates.</div>
      </section>
    </template>

    <ScheduleSlotModal :show="slotModal" @close="slotModal = false" />
    <BlockDateModal :show="blockModal" @close="blockModal = false" />
    <ConfirmModal v-model:modelValue="confirm.visible" title="Delete Slot" :message="confirm.message" confirmText="Delete" @confirm="onDeleteSlot" @cancel="confirm.visible = false" />
    <ConfirmModal v-model:modelValue="confirmDate.visible" title="Remove Block" :message="confirmDate.message" confirmText="Remove" @confirm="onDeleteDate" @cancel="confirmDate.visible = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import ScheduleSlotModal from '@/components/staff/modals/ScheduleSlotModal.vue'
import BlockDateModal from '@/components/staff/modals/BlockDateModal.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'

const store = useStaffStore()
const loading = ref(true)
const slotModal = ref(false)
const blockModal = ref(false)
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const confirm = ref({ visible: false, slot: null, message: '' })
const confirmDate = ref({ visible: false, dateItem: null, message: '' })

function getSlotsForDay(dayIdx) { return store.schedule.filter(s => s.dayOfWeek === dayIdx) }
function confirmDeleteSlot(slot) { confirm.value.slot = slot; confirm.value.message = `Delete ${slot.startTime}–${slot.endTime} on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek]}?`; confirm.value.visible = true }
function onDeleteSlot() { if (confirm.value.slot) { store.deleteScheduleSlot(confirm.value.slot.id); store.showToast('Slot deleted', 'success') } }
function confirmDeleteDate(d) { confirmDate.value.dateItem = d; confirmDate.value.message = `Remove blocked date ${d.date}?`; confirmDate.value.visible = true }
function onDeleteDate() { if (confirmDate.value.dateItem) { store.deleteUnavailableDate(confirmDate.value.dateItem.id); store.showToast('Date unblocked', 'success') } }

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
