<script setup>
import { ref, computed } from 'vue';
import ReviewCard from './ReviewCard.vue';

const props = defineProps({
  reviews: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  perPage: { type: Number, default: 5 },
  showSource: { type: Boolean, default: false },
});

const currentPage = ref(1);

const paginated = computed(() => {
  const start = 0;
  const end = currentPage.value * props.perPage;
  return props.reviews.slice(start, end);
});

const totalPages = computed(() => Math.ceil(props.reviews.length / props.perPage));

const hasMore = computed(() => currentPage.value < totalPages.value);

function loadMore() {
  if (hasMore.value) currentPage.value++;
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="bg-white rounded-xl border border-landing-border p-5 animate-pulse">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-slate-100"></div>
          <div class="flex-1 space-y-1.5">
        <div class="h-3 bg-slate-100 rounded w-24"></div>
        <div class="h-2.5 bg-slate-100 rounded w-16"></div>
          </div>
        </div>
        <div class="h-3 bg-slate-100 rounded w-full mb-1.5"></div>
        <div class="h-3 bg-slate-100 rounded w-3/4"></div>
      </div>
    </div>

    <div v-else-if="reviews.length === 0" class="text-center py-12">
      <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 001.005.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
      <p class="text-sm font-semibold text-slate-400">No reviews yet</p>
      <p class="text-xs text-slate-300 mt-1">Be the first to share your experience</p>
    </div>

    <TransitionGroup v-else name="review-fade" tag="div" class="space-y-4">
      <ReviewCard v-for="review in paginated" :key="review.id" :review="review" :show-source="showSource" />
    </TransitionGroup>

    <button
      v-if="hasMore"
      class="w-full py-3 text-sm font-semibold text-brand-primary border border-brand-primary/20 rounded-xl hover:bg-brand-primary/5 transition cursor-pointer"
      @click="loadMore"
    >
      Load More Reviews
    </button>
  </div>
</template>

<style scoped>
.review-fade-enter-active { transition: all 0.3s ease-out; }
.review-fade-enter-from { opacity: 0; transform: translateY(8px); }
</style>
