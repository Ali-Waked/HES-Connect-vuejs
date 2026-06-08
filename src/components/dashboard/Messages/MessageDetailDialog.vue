<script setup>
import { ref } from 'vue';
import BaseDialog from '../global/BaseDialog.vue';
import BaseBadge from '../global/BaseBadge.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  message: { type: Object, default: null }
});

const emit = defineEmits(['close', 'replied']);

const replyText = ref('');
const isReplying = ref(false);

const getStatusVariant = (status) => {
  switch (status) {
    case 'new': return 'info';
    case 'read': return 'warning';
    case 'replied': return 'success';
    default: return 'neutral';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
};

const sendReply = () => {
  if (!replyText.value.trim()) return;
  
  isReplying.value = true;
  // Simulate API call
  setTimeout(() => {
    emit('replied');
    replyText.value = '';
    isReplying.value = false;
    emit('close');
  }, 1000);
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    title="Message Details" 
    size="md"
    @close="$emit('close')"
  >
    <div v-if="message" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
            {{ message.name.charAt(0) }}
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ message.name }}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ message.email }}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <BaseBadge :variant="getStatusVariant(message.status)">
            {{ message.status }}
          </BaseBadge>
          <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{{ formatDate(message.created_at) }}</span>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
        <div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {{ message.message }}
        </div>
      </div>

      <div v-if="message.status !== 'replied'" class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Reply</label>
        <textarea 
          v-model="replyText"
          rows="4"
          class="w-full p-4 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none transition resize-none"
          placeholder="Type your reply here..."
        ></textarea>
        <div class="flex justify-end">
          <button 
            @click="sendReply"
            :disabled="!replyText.trim() || isReplying"
            class="inline-flex items-center justify-center gap-2 py-2 px-6 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition"
          >
            <span v-if="isReplying" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined text-lg">send</span>
            {{ isReplying ? 'Sending...' : 'Send Reply' }}
          </button>
        </div>
      </div>
      <div v-else class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-emerald-700">
        <span class="material-symbols-outlined">check_circle</span>
        <span class="text-sm font-medium">This message has been replied to.</span>
      </div>
    </div>
  </BaseDialog>
</template>
