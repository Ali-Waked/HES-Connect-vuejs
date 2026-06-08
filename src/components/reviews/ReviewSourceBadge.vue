<script setup>
defineProps({
  source: { type: String, default: 'platform' }
});

const config = {
  platform: { bg: 'bg-brand-primary/10', text: 'text-brand-primary', label: 'Platform Review' },
  facility: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Facility Review' },
  doctor: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Doctor Review' },
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
    :class="[config[source]?.bg || config.platform.bg, config[source]?.text || config.platform.text]"
  >
    {{ config[source]?.label || config.platform.label }}
  </span>
</template>
