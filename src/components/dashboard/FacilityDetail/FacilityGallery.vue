<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  images: { type: Array, default: () => [] },
  coverImage: { type: String, default: '' },
});

const lightboxOpen = ref(false);
const activeIndex = ref(0);

function openLightbox(index) {
  activeIndex.value = index;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function prevImage(allImages) {
  activeIndex.value = (activeIndex.value - 1 + allImages.length) % allImages.length;
}

function nextImage(allImages) {
  activeIndex.value = (activeIndex.value + 1) % allImages.length;
}

function getImageSrc(image) {
  if (typeof image === 'string') return image;
  return image.image_url || '';
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ t('facilityDetail.gallery') }}
        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ images.length }}</span>
      </h3>
    </div>
    <div class="p-6">
      <div v-if="images.length === 0 && !coverImage" class="flex flex-col items-center justify-center py-8 text-center gap-3">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('common.noData') || 'No images' }}</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-brand-primary transition"
          @click="openLightbox(index)"
        >
          <img
            :src="getImageSrc(image)"
            :alt="`Image ${index + 1}`"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors" />
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
        @click.self="closeLightbox"
      >
        <button
          class="absolute top-4 right-4 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition cursor-pointer"
          @click="closeLightbox"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          v-if="images.length > 1"
          class="absolute left-4 text-white/60 hover:text-white p-3 hover:bg-white/10 rounded-full transition cursor-pointer"
          @click.stop="prevImage(images)"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img
          :src="getImageSrc(images[activeIndex])"
          :alt="`Image ${activeIndex + 1}`"
          class="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
        <button
          v-if="images.length > 1"
          class="absolute right-4 text-white/60 hover:text-white p-3 hover:bg-white/10 rounded-full transition cursor-pointer"
          @click.stop="nextImage(images)"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div class="absolute bottom-4 text-white/60 text-sm font-semibold">
          {{ activeIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>
