<script setup>
import BaseDialog from '../global/BaseDialog.vue';
import BaseBadge from '../global/BaseBadge.vue';
import RatingStars from '../global/RatingStars.vue';
import { useReviewsStore } from '../../../stores/reviews';

const props = defineProps({
  show: { type: Boolean, required: true },
  review: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useReviewsStore();

const getStatusVariant = (status) => {
  switch (status) {
    case 'approved': return 'success';
    case 'hidden': return 'danger';
    case 'pending': return 'warning';
    default: return 'neutral';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
};

const approve = () => {
  store.approveReview(props.review.id);
  emit('close');
};

const hide = () => {
  store.hideReview(props.review.id);
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    title="Review Details" 
    size="md"
    @close="$emit('close')"
  >
    <div v-if="review" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ review.user }}</h4>
            <div class="flex items-center gap-2">
              <RatingStars :rating="review.rating" size="xs" />
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{{ formatDate(review.created_at) }}</span>
            </div>
          </div>
        </div>
        <BaseBadge :variant="getStatusVariant(review.status)">
          {{ review.status }}
        </BaseBadge>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Comment</label>
        <div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
          "{{ review.comment }}"
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button 
          v-if="review.status !== 'hidden'"
          @click="hide"
          class="inline-flex items-center justify-center gap-2 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold rounded-lg transition"
        >
          <span class="material-symbols-outlined text-lg">visibility_off</span>
          Hide Review
        </button>
        <button 
          v-if="review.status !== 'approved'"
          @click="approve"
          class="inline-flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition shadow-md shadow-emerald-600/10"
        >
          <span class="material-symbols-outlined text-lg">check_circle</span>
          Approve Review
        </button>
      </div>
    </div>
  </BaseDialog>
</template>
