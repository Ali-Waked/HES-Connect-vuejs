<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Confirm' },
  isDanger: { type: Boolean, default: true }
});

defineEmits(['confirm', 'close']);
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-[440px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-6 pb-0 flex justify-between items-center">
        <h3 
          class="text-lg font-bold"
          :class="isDanger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'"
        >
          {{ title }}
        </h3>
        <button 
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-6 pt-3">
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed" v-html="message"></p>
      </div>

      <div class="p-4 px-6 bg-slate-50 dark:bg-slate-900/40 flex justify-end gap-3">
        <button 
          type="button" 
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition cursor-pointer"
          @click="$emit('close')"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          type="button" 
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg text-sm font-semibold text-white transition cursor-pointer"
          :class="isDanger ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10' : 'bg-brand-primary hover:bg-brand-primary-hover shadow-md shadow-brand-primary/10'"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
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
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
