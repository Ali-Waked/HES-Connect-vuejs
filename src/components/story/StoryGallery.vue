<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  images: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  patientFirstName: { type: String, default: '' }
});

const activeIndex = ref(0);
const currentImage = computed(() => props.images?.[activeIndex.value] || null);

function select(i) { activeIndex.value = i; }
</script>

<template>
  <div class="space-y-3">
    <div class="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700 aspect-video">
      <img v-if="currentImage" :src="currentImage" :alt="title"
        class="h-full w-full object-cover transition-opacity duration-300"
        :key="activeIndex" />
      <div v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 dark:to-slate-700">
        <span class="material-symbols-outlined text-6xl text-brand-primary/30">favorite</span>
      </div>
      <span v-if="images?.length > 1"
        class="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-white">
        {{ activeIndex + 1 }} / {{ images.length }}
      </span>
    </div>

    <div v-if="images?.length > 1" class="flex gap-2">
      <button v-for="(img, i) in images.slice(0, 4)" :key="i"
        class="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105"
        :class="i === activeIndex ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-slate-200 dark:border-slate-700'"
        @click="select(i)">
        <img :src="img" :alt="`Thumbnail ${i + 1}`" class="h-full w-full object-cover" />
      </button>
    </div>
  </div>
</template>
