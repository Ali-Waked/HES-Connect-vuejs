<script setup>
defineProps({
  rating: { type: Number, required: true },
  max: { type: Number, default: 5 },
  size: { type: String, default: 'sm' }
});

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl'
};
</script>

<template>
  <div class="flex items-center gap-0.5">
    <span 
      v-for="i in max" 
      :key="i"
      class="material-symbols-outlined"
      :class="[
        sizeClasses[size],
        i <= Math.round(rating) ? 'text-amber-400 fill-1' : 'text-slate-300'
      ]"
      style="font-variation-settings: 'FILL' 1"
    >
      {{ i <= Math.round(rating) ? 'star' : 'star' }}
    </span>
  </div>
</template>

<style scoped>
.fill-1 {
  font-variation-settings: 'FILL' 1;
}
</style>
