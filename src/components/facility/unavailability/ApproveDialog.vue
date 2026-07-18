<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  show: { type: Boolean, required: true },
  request: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

defineEmits(['confirm', 'close'])

const { t } = useI18n()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[110] p-4" @click.self="$emit('close')">
      <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-[440px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-slide-up">
        <div class="p-6 pb-0 flex justify-between items-center">
          <h3 class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ t('unavailability.approveTitle') || 'Approve Request?' }}</h3>
          <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" @click="$emit('close')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 pt-3">
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ t('unavailability.approveConfirm') || 'This unavailable period will block appointment booking during the selected time.' }}
          </p>
        </div>
        <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">
            {{ t('common.cancel') }}
          </button>
          <button type="button" :disabled="saving" class="inline-flex items-center justify-center gap-1.5 py-2 px-4.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-emerald-500/15 transition cursor-pointer" @click="$emit('confirm')">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            {{ t('unavailability.approve') || 'Approve' }}
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
