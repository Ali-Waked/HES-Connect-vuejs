<script setup>
defineProps({
  padding: { type: String, default: 'md' },
})
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-elevated border border-slate-100"
    :class="[
      padding === 'none' ? '' : padding === 'sm' ? 'p-6' : padding === 'lg' ? 'p-10' : 'p-8',
    ]"
  >
    <slot />
  </div>
</template>
