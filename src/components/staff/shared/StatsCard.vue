<script setup>
defineProps({
  icon: { type: String, required: true },
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  tone: { type: String, default: 'brand' }
});

const tones = {
  brand: 'bg-brand-primary/10 text-brand-primary',
  blue: 'bg-blue-100/30 text-blue-700',
  amber: 'bg-amber-100/30 text-amber-700',
  purple: 'bg-purple-100/30 text-purple-700',
  red: 'bg-red-100/30 text-red-700',
  green: 'bg-green-100/30 text-green-700',
  slate: 'bg-slate-100 text-slate-700'
};
</script>

<template>
  <article class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition hover:shadow-md">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ value }}</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ label }}</p>
      </div>
      <span class="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl" :class="tones[tone] || tones.brand">
        {{ icon }}
      </span>
    </div>
  </article>
</template>
