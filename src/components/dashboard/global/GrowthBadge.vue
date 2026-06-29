<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: null }
});

const isPositive = computed(() => props.value > 0);
const isNegative = computed(() => props.value < 0);
const isZero = computed(() => props.value === 0 || props.value === null || props.value === undefined);

const cls = computed(() => {
  if (isZero.value) return 'text-slate-400 bg-slate-100 dark:text-slate-500 dark:bg-slate-800';
  if (isPositive.value) return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30';
  return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30';
});
</script>

<template>
  <span
    class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none"
    :class="cls"
  >
    <template v-if="isZero">0</template>
    <template v-else>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          v-if="isPositive"
          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
        <path
          v-else
          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
      {{ Math.abs(value) }}%
    </template>
  </span>
</template>
