<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useReviewsStore } from '../../../stores/reviews';
import { useDashboardStore } from '../../../stores/dashboard';
import { replyToReview, updateReview } from '@/services/reviewService';

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
const maxReplyLength = 5000;

const replyCharCount = computed(() => replyText.value.length);

const statusStyle = {
  pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
  approved: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
  rejected: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/30',
  hidden: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

function getStatusStyle(status) {
  return statusStyle[status?.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
}

async function toggleVisibility() {
  const id = props.review.id;
  const isHidden = props.review.status === 'hidden';
  if (isHidden) {
    await store.showReview(id);
  } else {
    await store.hideReview(id);
  }
  emit('close');
}

async function toggleFeatured() {
  const id = props.review.id;
  const newValue = !props.review.is_featured;
  try {
    await updateReview(id, { is_featured: newValue });
    props.review.is_featured = newValue;
    dashboardStore.addToast(newValue ? 'Review featured' : 'Review unfeatured', 'success');
  } catch (err) {
    dashboardStore.addToast(err.response?.data?.message || 'Failed to update review', 'error');
  }
}

async function submitReply() {
  if (!replyText.value.trim() || submitting.value) return;
  const id = props.review.id;
  submitting.value = true;
  try {
    const { data } = await replyToReview(id, { reply: replyText.value.trim() });
    const updated = data.data || data;
    if (updated.admin_reply != null) {
      props.review.admin_reply = updated.admin_reply;
      props.review.replied_by = updated.replied_by;
      props.review.replied_at = updated.replied_at;
    } else {
      props.review.admin_reply = replyText.value.trim();
      props.review.replied_at = new Date().toISOString();
    }
    dashboardStore.addToast(t('reviews.replySuccess') || 'Reply submitted successfully', 'success');
    replyText.value = '';
  } catch (err) {
    dashboardStore.addToast(err.response?.data?.message || 'Failed to submit reply', 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div
    v-if="show && review"
    class="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700/80 animate-slide-up">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.951.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('reviews.details') || 'Review Details' }}</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">ID: #{{ review.id }}</p>
          </div>
        </div>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6">
        <!-- User Profile -->
        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <div v-if="review.user?.avatar" class="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700">
            <img :src="review.user.avatar" :alt="localField(review.user, 'name')" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-12 h-12 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-700">
            <span class="text-lg font-bold text-brand-primary">{{ (localField(review.user, 'name') || '?').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-base font-bold text-slate-900 dark:text-white">{{ localField(review.user, 'name') || '—' }}</h4>
            <p v-if="review.user?.email" class="text-sm text-slate-500 dark:text-slate-400">{{ review.user.email }}</p>
          </div>
          <span
            class="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
            :class="getStatusStyle(review.status)"
          >
            {{ t(`reviews.${review.status}`) || review.status || '—' }}
          </span>
        </div>

        <!-- Rating + Featured -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex text-amber-400">
              <svg v-for="s in 5" :key="s" class="w-5 h-5" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ review.rating }} / 5</span>
          </div>
          <button
            v-permission="'reviews.manage'"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            :class="review.is_featured
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
            @click="toggleFeatured"
          >
            <svg class="w-3.5 h-3.5" :class="review.is_featured ? 'text-yellow-500' : 'text-slate-400'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {{ review.is_featured ? (t('reviews.featured') || 'Featured') : (t('reviews.notFeatured') || 'Not Featured') }}
          </button>
        </div>

        <!-- Comment -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('reviews.commentLabel') || 'Comment' }}</label>
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
            "{{ review.comment || t('common.noData') || 'No comment' }}"
          </div>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formatDate(review.created_at) }}
          </span>
          <span>{{ t('reviews.reviewDate') || 'Submitted' }}</span>
        </div>

        <!-- Admin Reply -->
        <div v-if="review.admin_reply" class="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-xl p-4 border border-brand-primary/10 space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-brand-primary uppercase tracking-wider">{{ t('reviews.staffReply') || 'Staff Reply' }}</span>
            <span v-if="review.replied_by" class="text-xs text-slate-400 dark:text-slate-500">— {{ review.replied_by.name }}</span>
            <span v-if="review.replied_at" class="text-xs text-slate-400 dark:text-slate-500 ml-auto">{{ formatDate(review.replied_at) }}</span>
          </div>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ review.admin_reply }}</p>
        </div>

        <!-- Reply Form -->
        <div v-else class="space-y-3">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('reviews.replyToReview') || 'Reply to Review' }}</label>
          <div class="relative">
            <textarea v-model="replyText"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-primary/20 outline-none transition min-h-[100px] resize-none"
              :placeholder="t('reviews.replyPlaceholder') || 'Write your reply to this review...'"
              :maxlength="maxReplyLength"
            ></textarea>
            <span class="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">{{ replyCharCount }}/5000</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          @click="emit('close')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ t('common.close') || 'Close' }}
        </button>
        <button
          v-if="!review.admin_reply"
          :disabled="!replyText.trim() || submitting || replyText.length > maxReplyLength"
          @click="submitReply"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-primary text-white shadow-md hover:bg-brand-primary-hover hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else>{{ t('reviews.submitReply') || 'Submit Reply' }}</span>
        </button>
        <button
          :disabled="store.actionLoading"
          @click="toggleVisibility"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :class="review.status !== 'hidden'
            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10'
            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'"
        >
          <svg v-if="review.status !== 'hidden'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ review.status !== 'hidden' ? (t('reviews.hideAction') || 'Hide') : (t('reviews.showAction') || 'Show') }}
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
