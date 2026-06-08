<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import ReviewCard from '../reviews/ReviewCard.vue';

defineProps({
  reviews: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const breakpoints = {
  0: { slidesPerView: 1, spaceBetween: 16 },
  640: { slidesPerView: 1, spaceBetween: 16 },
  768: { slidesPerView: 2, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 24 },
};
</script>

<template>
  <section class="py-16 lg:py-20 bg-landing-cream dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <h2 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">What People Are Saying</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Real feedback from our community</p>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="n in 3" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-landing-border dark:border-slate-700 p-5 animate-pulse">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700"></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24"></div>
              <div class="h-2.5 bg-slate-100 dark:bg-slate-700 rounded w-16"></div>
            </div>
          </div>
          <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full mb-1.5"></div>
          <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>

      <div v-else>
        <Swiper
          :modules="[Autoplay, Pagination]"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          :pagination="{ clickable: true, dynamicBullets: true }"
          :loop="true"
          :breakpoints="breakpoints"
          class="pb-10"
        >
          <SwiperSlide v-for="(review, i) in reviews" :key="review.id">
            <ReviewCard :review="review" :show-source="true" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<style scoped>
.swiper-pagination {
  position: relative;
  margin-top: 1rem;
}
:deep(.swiper-pagination-bullet-active) {
  background: var(--color-brand-primary);
}
</style>
