<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RatingStars from '../global/RatingStars.vue';
import LoadingSkeleton from '../global/LoadingSkeleton.vue';

const { t } = useI18n();

const props = defineProps({
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  ratingBreakdown: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['retry']);

const breakdownRows = computed(() => {
  return [5, 4, 3, 2, 1].map(star => {
    const count = props.ratingBreakdown[String(star)] || 0;
    const pct = props.totalReviews > 0 ? (count / props.totalReviews) * 100 : 0;
    return { star, count, pct };
  });
});

const formattedRating = computed(() => {
  return props.averageRating % 1 === 0
    ? props.averageRating.toFixed(0)
    : props.averageRating.toFixed(1);
});
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {{ t('reviews.averageRating') || 'Rating Summary' }}
      </h3>
    </div>

    <div class="p-6">
      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="flex flex-col items-center gap-3 md:border-r md:border-slate-100 dark:md:border-slate-800 md:pr-8">
            <div class="w-20 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div class="flex gap-1">
              <div v-for="n in 5" :key="n" class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div class="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div class="flex-1 space-y-3 w-full">
            <div v-for="n in 5" :key="n" class="flex items-center gap-3">
              <div class="w-6 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div class="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div class="w-8 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-6 text-center gap-3">
        <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ error }}</p>
        <button
          class="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
          @click="emit('retry')"
        >
          {{ t('reviews.retry') }}
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="totalReviews === 0" class="flex flex-col items-center justify-center py-8 text-center gap-3">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 001.902 0l1.519-4.674c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('reviews.noReviews') || 'No reviews available yet' }}</p>
      </div>

      <!-- Content -->
      <div v-else class="flex flex-col md:flex-row gap-8 items-center">
        <!-- Left: Score -->
        <div class="flex flex-col items-center gap-2 md:border-r md:border-slate-100 dark:md:border-slate-800 md:pr-8">
          <span class="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{{ formattedRating }}</span>
          <RatingStars :rating="averageRating" size="lg" />
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {{ t('reviews.basedOn') || 'Based on' }} {{ totalReviews }} {{ t('reviews.total').toLowerCase() || 'reviews' }}
          </p>
        </div>

        <!-- Right: Breakdown -->
        <div class="flex-1 space-y-2.5 w-full" role="list" :aria-label="`${t('reviews.averageRating')} ${formattedRating}`">
          <div
            v-for="row in breakdownRows"
            :key="row.star"
            class="flex items-center gap-3"
            role="listitem"
            :aria-label="`${row.star} stars: ${row.count} reviews, ${row.pct.toFixed(0)} percent`"
          >
            <span class="w-6 text-right text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">{{ row.star }}</span>
            <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div class="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="row.pct" aria-valuemin="0" aria-valuemax="100">
              <div
                class="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                :style="{ width: `${row.pct}%` }"
              />
            </div>
            <span class="w-10 text-right text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">{{ row.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
