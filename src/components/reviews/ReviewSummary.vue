<script setup>
import { computed } from 'vue';

const props = defineProps({
  stats: { type: Object, required: true }
});

const sortedDist = computed(() =>
  [5, 4, 3, 2, 1].map(star => ({
    star,
    count: props.stats.distribution?.[star] || 0,
    percentage: props.stats.total > 0 ? ((props.stats.distribution?.[star] || 0) / props.stats.total) * 100 : 0
  }))
);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white p-5 rounded-xl border border-landing-border shadow-sm">
    <div class="text-center md:border-r border-landing-border py-3">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Rating</p>
      <div class="text-4xl font-extrabold text-slate-900 mb-1">{{ stats.average }}</div>
      <div class="flex justify-center gap-0.5 mb-1">
        <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= Math.round(stats.average) ? 'text-amber-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>
      <p class="text-xs font-semibold text-slate-500">{{ stats.total }} reviews</p>
    </div>
    <div class="md:col-span-2 space-y-2">
      <div v-for="item in sortedDist" :key="item.star" class="flex items-center gap-3">
        <span class="text-xs font-bold text-slate-600 w-6 shrink-0 text-right">{{ item.star }}</span>
        <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <div class="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-amber-400 rounded-full transition-all duration-500" :style="{ width: `${item.percentage}%` }"></div>
        </div>
        <span class="text-xs font-bold text-slate-400 w-8 text-right shrink-0">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>
