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

  <template v-else-if="variant === 'facility-card'">
    <div v-for="n in count" :key="n" class="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div class="h-48 bg-slate-100"></div>
      <div class="p-5 space-y-4">
        <div class="flex justify-between items-start">
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-slate-100 rounded w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
          <div class="h-6 bg-slate-100 rounded-full w-20"></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="h-8 bg-slate-50 rounded"></div>
          <div class="h-8 bg-slate-50 rounded"></div>
        </div>
        <div class="h-10 bg-slate-100 rounded w-full"></div>
      </div>
    </div>
  </template>
</template>
