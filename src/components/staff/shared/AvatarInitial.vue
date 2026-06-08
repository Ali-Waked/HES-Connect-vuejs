<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' }
});

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl'
};
</script>

<template>
  <div class="flex shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-white ring-2 ring-brand-primary/15" :class="sizes[size]">
    {{ name.charAt(0).toUpperCase() }}
  </div>
</template>
