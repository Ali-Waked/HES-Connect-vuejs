<script setup>
import { useContactMessages } from '../../../composables/useContactMessages';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import BaseDialog from '../global/BaseDialog.vue';
import BaseBadge from '../global/BaseBadge.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  message: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'status-updated']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const { updateMessageStatus } = useContactMessages();

function getStatusVariant(status) {
  switch (status) {
    case 'new': return 'info';
    case 'read': return 'warning';
    case 'replied': return 'success';
    default: return 'neutral';
  }
}

async function handleMarkRead() {
  if (!props.message) return;
  const { success } = await updateMessageStatus(props.message.id, 'read');
  if (success) emit('status-updated');
}

async function handleMarkReplied() {
  if (!props.message) return;
  const { success } = await updateMessageStatus(props.message.id, 'replied');
  if (success) emit('status-updated');
}
</script>

<template>
  <BaseDialog
    :show="show"
    :title="t('contactMessages.detailsTitle')"
    size="md"
    @close="$emit('close')"
  >
    <div v-if="message" class="space-y-6">
      <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
            {{ localField(message, 'name').charAt(0) }}
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ localField(message, 'name') }}</h4>
            <p class="text-xs text-slate-500">{{ message.email }}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <BaseBadge :variant="getStatusVariant(message.status)">
            {{ t('statuses.' + message.status, message.status) }}
          </BaseBadge>
          <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{{ formatDate(message.created_at) }}</span>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('contactMessages.messageLabel') }}</label>
        <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {{ localField(message, 'message') }}
        </div>
      </div>

      <div class="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('contactMessages.statusActions') }}</label>
        <div class="flex flex-wrap gap-3">
          <button
            v-if="message.status === 'new'"
            @click="handleMarkRead"
            :disabled="saving"
            class="inline-flex items-center gap-2 py-2 px-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5" />
            </svg>
            {{ t('contactMessages.markRead') }}
          </button>
          <button
            v-if="message.status === 'new' || message.status === 'read'"
            @click="handleMarkReplied"
            :disabled="saving"
            class="inline-flex items-center gap-2 py-2 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
            </svg>
            {{ t('contactMessages.markReplied') }}
          </button>
          <span
            v-if="message.status === 'replied'"
            class="inline-flex items-center gap-2 py-2 px-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-lg border border-emerald-200 dark:border-emerald-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('contactMessages.alreadyReplied') }}
          </span>
        </div>
      </div>
    </div>
  </BaseDialog>
</template>
