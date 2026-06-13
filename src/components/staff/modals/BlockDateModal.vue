<template>
  <StaffModalShell :show="show" title="Block Date" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('common.date') }}</label>
        <input type="date" v-model="date" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('common.reason') }}</label>
        <input v-model="reason" placeholder="e.g. Training, Leave" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-3 py-2.5 text-sm" required />
      </div>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">Block Date</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import { useI18n } from 'vue-i18n'

defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { t } = useI18n()
const store = useStaffStore()
const date = ref('')
const reason = ref('')
const error = ref('')

function submit() {
  if (!date.value || !reason.value) { error.value = 'All fields required'; return }
  store.addUnavailableDate({ date: date.value, reason: reason.value })
  store.showToast('Date blocked', 'success')
  emit('close')
}
</script>
