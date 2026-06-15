<script setup>
defineProps({
  text: { type: String, default: 'or' },
})
</script>

<template>
  <div class="relative my-6">
    <div class="absolute inset-0 flex items-center" aria-hidden="true">
      <div class="w-full border-t border-slate-200"></div>
    </div>
    <div class="relative flex justify-center">
      <span class="bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
        {{ text }}
      </span>
    </div>
  </div>
</template>
