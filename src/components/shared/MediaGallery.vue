<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

defineProps({
  images: { type: Array, default: () => [] },
  aspectRatio: { type: String, default: 'aspect-video' },
});

const thumbsSwiper = ref(null);
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(index) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}
</script>

<template>
  <div v-if="images.length > 0" class="space-y-3">
    <div class="relative group rounded-xl overflow-hidden border border-landing-border dark:border-slate-700 shadow-sm">
      <Swiper
        :modules="[Navigation, Pagination, Thumbs]"
        :navigation="{ prevEl: '.swiper-prev', nextEl: '.swiper-next' }"
        :pagination="{ clickable: true, dynamicBullets: true }"
        :thumbs="{ swiper: thumbsSwiper }"
        :loop="images.length > 1"
        class="w-full"
      >
        <SwiperSlide v-for="(img, i) in images" :key="i">
          <div
            class="w-full bg-slate-100 dark:bg-slate-700 cursor-pointer"
            :class="aspectRatio"
            @click="openLightbox(i)"
          >
            <img
              :src="img"
              :alt="`Gallery image ${i + 1}`"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </SwiperSlide>
      </Swiper>
      <button
        class="swiper-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
      </button>
      <button
        class="swiper-next absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
      </button>
    </div>

    <div v-if="images.length > 1" class="hidden sm:block">
      <Swiper
        :modules="[]"
        :space-between="8"
        :slides-per-view="4"
        :watch-slides-progress="true"
        class="thumbs-gallery"
        @swiper="thumbsSwiper = $event"
      >
        <SwiperSlide v-for="(img, i) in images" :key="i">
          <div class="aspect-video rounded-lg overflow-hidden border-2 border-transparent transition-all duration-200 cursor-pointer swiper-slide-thumb-active:border-brand-primary">
            <img :src="img" :alt="`Thumb ${i + 1}`" class="w-full h-full object-cover" loading="lazy" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-[999] bg-slate-900/95 flex items-center justify-center p-4"
        @click.self="lightboxOpen = false"
      >
        <button class="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer" @click="lightboxOpen = false">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <button class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer" @click="lightboxIndex = lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <img :src="images[lightboxIndex]" alt="Lightbox" class="max-w-full max-h-[85vh] object-contain rounded-xl" />
        <button class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer" @click="lightboxIndex = lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
        <p class="absolute bottom-4 text-sm text-white/60 font-medium">{{ lightboxIndex + 1 }} / {{ images.length }}</p>
      </div>
    </Teleport>
  </div>

  <div v-else class="rounded-xl border border-landing-border dark:border-slate-700 bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 flex items-center justify-center" :class="aspectRatio">
    <svg class="w-12 h-12 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
    </svg>
  </div>
</template>

<style scoped>
.thumbs-gallery :deep(.swiper-slide-thumb-active) {
  border-color: var(--color-brand-primary);
}
.thumbs-gallery :deep(.swiper-wrapper) {
  padding: 2px 0;
}
</style>
