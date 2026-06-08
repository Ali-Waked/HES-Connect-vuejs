<script setup>
defineProps({
  modelValue: { type: String, required: true }
});

defineEmits(['update:modelValue']);

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'grid_view' },
  { id: 'personal', label: 'Personal Info', icon: 'badge' },
  { id: 'security', label: 'Security', icon: 'shield_lock' },
  { id: 'activity', label: 'Activity', icon: 'history' }
];
</script>

<template>
  <nav class="overflow-x-auto border-b border-slate-200 dark:border-slate-700">
    <div class="flex min-w-max gap-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="relative inline-flex h-14 items-center gap-2 text-sm font-semibold transition"
        :class="modelValue === tab.id ? 'text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'"
        @click="$emit('update:modelValue', tab.id)"
      >
        <span class="material-symbols-outlined text-[19px]">{{ tab.icon }}</span>
        {{ tab.label }}
        <span
          class="absolute inset-x-0 bottom-0 h-0.5 rounded-full transition"
          :class="modelValue === tab.id ? 'bg-brand-primary' : 'bg-transparent'"
        ></span>
      </button>
    </div>
  </nav>
</template>
