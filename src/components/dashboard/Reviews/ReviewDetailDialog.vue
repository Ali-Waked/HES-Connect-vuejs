<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useReviewsStore } from '../../../stores/reviews';
import { useDashboardStore } from '../../../stores/dashboard';
import { replyToReview } from '@/services/reviewService';

const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();

const props = defineProps({
  show: { type: Boolean, required: true },
  review: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useReviewsStore();
const dashboardStore = useDashboardStore();

const replyText = ref('');
const submitting = ref(false);
const maxReplyLength = 5000

const replyCharCount = computed(() => replyText.value.length)

async function toggleVisibility() {
  const uuid = props.review.uuid || props.review.id;
  if (props.review.is_visible) {
    await store.hideReview(uuid);
  } else {
    await store.showReview(uuid);
  }
  emit('close');
}

async function submitReply() {
  if (!replyText.value.trim() || submitting.value) return
  const uuid = props.review.uuid || props.review.id
  submitting.value = true
  try {
    const { data } = await replyToReview(uuid, { reply: replyText.value.trim() })
    const replyData = data.data?.reply || data.reply
    props.review.is_replied = true
    props.review.reply = replyData || { reply: replyText.value.trim(), created_at: new Date().toISOString() }
    dashboardStore.addToast('Reply submitted successfully', 'success')
    replyText.value = ''
  } catch (err) {
    dashboardStore.addToast(err.response?.data?.message || 'Failed to submit reply', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div
    v-if="show && review"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('reviews.details') }}</h3>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-5 overflow-y-auto flex-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-lg">person</span>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ review.user?.name || '—' }}</h4>
              <p v-if="review.user?.email" class="text-xs text-slate-500 dark:text-slate-400">{{ review.user.email }}</p>
            </div>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': review.is_visible,
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': !review.is_visible,
          }">
            {{ review.is_visible ? t('reviews.visible') : t('reviews.hidden') }}
          </span>
        </div>

        <div v-if="review.facility" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ t('reviews.facility') || 'Facility' }}:</span>
          <span>{{ localField(review.facility, 'name') }}</span>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex text-amber-400">
            <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ review.rating }} / 5</span>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('reviews.commentLabel') }}</label>
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
            "{{ review.comment || t('common.noData') || 'No comment' }}"
          </div>
        </div>

        <div class="text-xs text-slate-400 dark:text-slate-500">
          <span class="font-medium">{{ t('reviews.reviewDate') }}:</span>
          {{ formatDate(review.created_at) }}
        </div>

        <div v-if="review.is_replied && review.reply" class="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-xl p-4 border border-brand-primary/10 space-y-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-primary text-base">support_agent</span>
            <span class="text-xs font-bold text-brand-primary uppercase tracking-wider">{{ t('reviews.staffReply') || 'Staff Reply' }}</span>
          </div>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ review.reply.reply }}</p>
          <p v-if="review.reply.created_at" class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">schedule</span>
            {{ formatDate(review.reply.created_at) }}
          </p>
        </div>

        <div v-else class="space-y-3">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('reviews.replyToReview') || 'Reply to Review' }}</label>
          <div class="relative">
            <textarea v-model="replyText"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-primary/20 outline-none transition min-h-[100px] resize-none"
              :placeholder="t('reviews.replyPlaceholder') || 'Write your reply to this review...'"
              :maxlength="maxReplyLength"></textarea>
            <span class="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">{{ replyCharCount }}/5000</span>
          </div>
        </div>
      </div>

      <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
        <button
          type="button"
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          @click="$emit('close')"
        >
          {{ t('common.close') || 'Close' }}
        </button>
        <button
          v-if="!review.is_replied"
          :disabled="!replyText.trim() || submitting || replyText.length > maxReplyLength"
          @click="submitReply"
          class="inline-flex items-center justify-center gap-2 py-2 px-4.5 rounded-lg text-sm font-semibold bg-brand-primary text-white shadow-md hover:bg-brand-primary-hover hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else>{{ t('reviews.submitReply') || 'Submit Reply' }}</span>
        </button>
        <button
          :disabled="store.actionLoading"
          @click="toggleVisibility"
          class="inline-flex items-center justify-center gap-2 py-2 px-4.5 rounded-lg text-sm font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :class="review.is_visible
            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10'
            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'"
        >
          <svg v-if="review.is_visible" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ review.is_visible ? t('reviews.hideAction') : t('reviews.showAction') }}
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
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
