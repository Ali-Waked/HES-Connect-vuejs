<script setup>
defineProps({
  variant: { type: String, default: 'card' },
  count: { type: Number, default: 1 }
});
</script>

<template>
  <template v-if="variant === 'card'">
    <div v-for="n in count" :key="n" class="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div class="h-32 bg-slate-100 rounded-lg mb-4"></div>
      <div class="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-slate-100 rounded w-1/2"></div>
    </div>
  </template>

  <template v-else-if="variant === 'stat'">
    <div v-for="n in count" :key="n" class="animate-pulse">
      <div class="h-8 bg-slate-200 rounded w-16 mx-auto mb-2"></div>
      <div class="h-3 bg-slate-200 rounded w-20 mx-auto"></div>
    </div>
  </template>

  <template v-else-if="variant === 'row'">
    <div v-for="n in count" :key="n" class="bg-white rounded-xl border border-slate-200 p-5 animate-pulse flex gap-4">
      <div class="w-12 h-12 bg-slate-100 rounded-full shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-slate-100 rounded w-1/3"></div>
        <div class="h-3 bg-slate-100 rounded w-2/3"></div>
      </div>
    </div>
  </template>
</template>
