<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserReviewStore } from '../../stores/userReview';
import { usePublicToast } from '../../composables/usePublicToast';

const { t } = useI18n();
const store = useUserReviewStore();
const { addToast } = usePublicToast();

const emit = defineEmits(['submitted']);

const rating = ref(0);
const comment = ref('');
const hoveredRating = ref(0);
const errors = ref({});

watch(() => store.review, (review) => {
  if (review) {
    rating.value = review.rating || 0;
    comment.value = review.comment || '';
  }
}, { immediate: true });

function setRating(val) {
  rating.value = val;
  errors.value.rating = null;
}

function validate() {
  const errs = {};
  if (rating.value === 0) errs.rating = t('publicReviews.ratingRequired');
  if (!comment.value.trim()) errs.comment = t('publicReviews.commentRequired');
  else if (comment.value.trim().length < 10) errs.comment = t('publicReviews.commentMinLength');
  else if (comment.value.trim().length > 1000) errs.comment = t('publicReviews.commentMaxLength');
  errors.value = errs;
  return Object.keys(errs).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;
  const result = await store.submitReview({
    rating: rating.value,
    comment: comment.value.trim(),
  });
  if (result.success) {
    addToast(store.hasReview ? t('publicReviews.updatedSuccess') : t('publicReviews.createdSuccess'));
    emit('submitted');
  } else {
    addToast(result.error || t('publicReviews.submitError'), 'error');
  }
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
      {{ store.hasReview ? t('publicReviews.updateTitle') : t('publicReviews.createTitle') }}
    </h3>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
      {{ store.hasReview ? t('publicReviews.updateDesc') : t('publicReviews.createDesc') }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {{ t('publicReviews.yourRating') }}
        </label>
        <div class="flex items-center gap-1">
          <button
            v-for="s in 5"
            :key="s"
            type="button"
            @click="setRating(s)"
            @mouseenter="hoveredRating = s"
            @mouseleave="hoveredRating = 0"
            class="p-0.5 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
          >
            <svg
              class="w-8 h-8 sm:w-9 sm:h-9"
              :class="s <= (hoveredRating || rating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </button>
          <span v-if="hoveredRating || rating" class="ml-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            {{ hoveredRating || rating }} / 5
          </span>
        </div>
        <p v-if="errors.rating" class="mt-1.5 text-xs text-red-500">{{ errors.rating }}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {{ t('publicReviews.yourComment') }}
        </label>
        <textarea
          v-model="comment"
          :placeholder="t('publicReviews.commentPlaceholder')"
          rows="4"
          maxlength="1000"
          class="input-base resize-none"
          :class="{ 'ring-2 ring-red-300 border-red-300': errors.comment }"
        ></textarea>
        <div class="flex justify-between items-center mt-1.5">
          <p v-if="errors.comment" class="text-xs text-red-500">{{ errors.comment }}</p>
          <p v-else class="text-xs text-slate-400">{{ comment.length }} / 1000</p>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          type="submit"
          :disabled="store.submitting"
          class="btn-primary px-6 py-2.5"
        >
          <svg v-if="store.submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {{ store.submitting ? t('publicReviews.submitting') : t('publicReviews.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>
