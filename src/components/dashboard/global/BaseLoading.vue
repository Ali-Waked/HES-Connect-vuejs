<script setup>
defineProps({
  message: { type: String, default: 'Loading data...' }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
    <div class="relative w-12 h-12">
      <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
      <div class="absolute inset-0 border-4 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p class="text-sm font-medium text-slate-500">{{ message }}</p>
  </div>
</template>
