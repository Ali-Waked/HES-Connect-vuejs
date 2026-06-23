<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFacilityDetailStore } from '../../../stores/facilityDetail';
import LoadingSkeleton from '../global/LoadingSkeleton.vue';
import FacilityReviewDetailDialog from './FacilityReviewDetailDialog.vue';

const { t } = useI18n();
const { formatDate } = useFormatDate();
const { localField } = useLocaleField();

function getReviewerName(review) {
  return localField(review.patient, 'name') || review.patient_name || '—';
}

function getReviewerInitial(review) {
  const name = getReviewerName(review);
  return name.charAt(0).toUpperCase();
}
const store = useFacilityDetailStore();

const props = defineProps({
  facilityUuid: { type: String, required: true },
});

const scrollTrigger = ref(null);
const showDetailDialog = ref(false);
const selectedReview = ref(null);

let observer = null;

onMounted(() => {
  store.resetReviews();
  store.fetchFacilityReviews(props.facilityUuid);

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !store.reviewsLoading && store.reviewsPage < store.reviewsLastPage) {
      store.fetchFacilityReviews(props.facilityUuid, true);
    }
  }, { rootMargin: '200px' });

  if (scrollTrigger.value) observer.observe(scrollTrigger.value);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

watch(scrollTrigger, (el) => {
  if (el && observer) observer.observe(el);
});

function openReview(review) {
  selectedReview.value = review;
  showDetailDialog.value = true;
}

async function handleToggle({ uuid, isActive }) {
  await store.toggleReviewVisibility(uuid, isActive);
  showDetailDialog.value = false;
  selectedReview.value = null;
}

const hasMore = computed(() => store.reviewsPage < store.reviewsLastPage);
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {{ t('reviews.title') || 'Facility Reviews' }}
        <span v-if="store.reviewsTotal > 0" class="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ store.reviewsTotal }}</span>
      </h3>
    </div>

    <div class="p-6">
      <div v-if="store.reviewsLoading && store.reviews.length === 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LoadingSkeleton v-for="n in 4" :key="n" card avatar :lines="2" :widths="['60%', '80%']" height="14px" />
      </div>

      <div v-else-if="store.reviewsError" class="flex flex-col items-center justify-center py-8 text-center gap-3">
        <div class="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('reviews.errorLoad') }}</p>
        <button
          class="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
          @click="store.fetchFacilityReviews(facilityUuid)"
        >
          {{ t('reviews.retry') }}
        </button>
      </div>

      <div v-else-if="store.reviews.length === 0" class="flex flex-col items-center justify-center py-8 text-center gap-3">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('reviews.noReviews') }}</p>
        <p class="text-xs text-slate-400 dark:text-slate-500">{{ t('reviews.noReviewsDesc') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="review in store.reviews"
          :key="review.uuid || review.id"
          class="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-primary/30 dark:hover:border-brand-primary/30 transition cursor-pointer flex flex-col h-full"
          @click="openReview(review)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
                {{ getReviewerInitial(review) }}
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ getReviewerName(review) }}</h4>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{{ formatDate(review.created_at) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="flex text-amber-400">
                <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold" :class="{
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': review.is_visible,
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': !review.is_visible,
              }">
                {{ review.is_visible ? (t('reviews.visible') || 'Active') : (t('reviews.hidden') || 'Hidden') }}
              </span>
            </div>
          </div>
          <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed italic flex-grow">
            "{{ review.comment || '—' }}"
          </p>
        </div>

        <div v-if="hasMore" ref="scrollTrigger" class="py-4 flex items-center justify-center">
          <div v-if="store.reviewsLoading" class="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
            <div class="w-4 h-4 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
            {{ t('reviews.loading') }}
          </div>
        </div>

        <div v-if="!hasMore && store.reviews.length > 0" class="py-4 text-center">
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('reviews.noMoreReviews') || 'No more reviews' }}</p>
        </div>
      </div>
    </div>

    <FacilityReviewDetailDialog
      :show="showDetailDialog"
      :review="selectedReview"
      @close="showDetailDialog = false"
      @toggle="handleToggle"
    />
  </div>
</template>
