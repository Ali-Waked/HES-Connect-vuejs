<script setup>
defineProps({
  icon: { type: String, required: true },
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  subtitle: { type: String, default: '' },
  tone: { type: String, default: 'brand' }
})

const tones = {
  brand: 'bg-brand-primary/10 text-brand-primary',
  blue: 'bg-blue-100/30 text-blue-700',
  amber: 'bg-amber-100/30 text-amber-700',
  purple: 'bg-purple-100/30 text-purple-700',
  red: 'bg-red-100/30 text-red-700',
  green: 'bg-green-100/30 text-green-700',
  slate: 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <article class="card-base p-5 flex items-start justify-between gap-4 hover:shadow-card-hover transition-shadow">
    <div class="min-w-0">
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{{ label }}</p>
      <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ value }}</p>
      <p v-if="subtitle" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{{ subtitle }}</p>
    </div>
    <span class="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl shrink-0" :class="tones[tone] || tones.brand">
      {{ icon }}
    </span>
  </article>
</template>
