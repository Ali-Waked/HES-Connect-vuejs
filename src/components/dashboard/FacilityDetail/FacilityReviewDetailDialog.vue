<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useLocaleField } from '../../../composables/useLocaleField';
import BaseDialog from '../global/BaseDialog.vue';

const { t } = useI18n();
const { formatDate } = useFormatDate();
const { localField } = useLocaleField();

function getReviewerName(review) {
  return localField(review?.patient, 'name') || review?.patient_name || '—';
}

const props = defineProps({
  show: { type: Boolean, required: true },
  review: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'toggle']);

const localVisible = ref(false);

watch(() => props.review, (val) => {
  if (val) localVisible.value = val.is_visible;
}, { immediate: true });

function handleToggle() {
  emit('toggle', {
    uuid: props.review?.uuid || props.review?.id,
    isActive: localVisible.value,
  });
}
</script>

<template>
  <BaseDialog :show="show && !!review" :title="t('reviews.details')" size="md" @close="emit('close')">
    <div v-if="review" class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
            {{ getReviewerName(review).charAt(0) }}
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ getReviewerName(review) }}</h4>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex text-amber-400">
          <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <span class="text-sm font-bold text-slate-600 dark:text-slate-300">{{ review.rating }} / 5</span>
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('reviews.commentLabel') }}</label>
        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          "{{ review.comment || t('common.noData') }}"
        </div>
      </div>

      <div class="text-xs text-slate-400 dark:text-slate-500">
        <span class="font-medium">{{ t('reviews.reviewDate') }}:</span>
        {{ formatDate(review.created_at) }}
      </div>

      <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-slate-900 dark:text-white">{{ t('reviews.visibility') || 'Active Status' }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ localVisible ? (t('reviews.visible') || 'Review is visible to users') : (t('reviews.hidden') || 'Review is hidden') }}
          </p>
        </div>
        <button
          type="button"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="localVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
          @click="localVisible = !localVisible; handleToggle()"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
            :class="localVisible ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>
  </BaseDialog>
</template>
