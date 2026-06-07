<script setup>
import { computed } from 'vue';
import RatingStars from './RatingStars.vue';

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    // { average, total, distribution: { 5: 10, 4: 5, ... } }
  }
});

const sortedDistribution = computed(() => {
  return [5, 4, 3, 2, 1].map(star => ({
    star,
    count: props.stats.distribution?.[star] || 0,
    percentage: props.stats.total > 0 
      ? ((props.stats.distribution?.[star] || 0) / props.stats.total) * 100 
      : 0
  }));
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <!-- Average Rating -->
    <div class="text-center md:border-r border-slate-100 py-4">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Average Rating</h4>
      <div class="text-5xl font-black text-slate-900 mb-2">{{ stats.average }}</div>
      <div class="flex justify-center mb-1">
        <RatingStars :rating="parseFloat(stats.average)" size="md" />
      </div>
      <p class="text-sm font-semibold text-slate-500">Based on {{ stats.total }} reviews</p>
    </div>

    <!-- Rating Distribution -->
    <div class="md:col-span-2 space-y-3">
      <div v-for="item in sortedDistribution" :key="item.star" class="flex items-center gap-4">
        <div class="flex items-center gap-1 w-8 shrink-0">
          <span class="text-xs font-bold text-slate-600">{{ item.star }}</span>
          <span class="material-symbols-outlined text-amber-400 text-xs fill-1">star</span>
        </div>
        <div class="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            class="h-full bg-amber-400 rounded-full transition-all duration-500" 
            :style="{ width: `${item.percentage}%` }"
          ></div>
        </div>
        <div class="w-10 text-right shrink-0">
          <span class="text-xs font-bold text-slate-400">{{ item.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fill-1 { font-variation-settings: 'FILL' 1; }
</style>
