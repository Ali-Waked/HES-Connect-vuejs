<script setup>
defineProps({
  label: { type: String, required: true },
  for: { type: String, default: '' },
  optional: { type: Boolean, default: false },
})
</script>

<template>
  <label
    :for="for"
    class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
  >
    {{ label }}
    <span v-if="optional" class="normal-case tracking-normal font-normal text-slate-400">(optional)</span>
  </label>
</template>
