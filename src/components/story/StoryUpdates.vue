<script setup>
defineProps({
  updates: { type: Array, default: () => [] }
});
</script>

<template>
  <section v-if="updates.length">
    <div class="flex items-center gap-2 mb-5">
      <span class="material-symbols-outlined text-lg text-brand-primary">notifications</span>
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Story Updates</h3>
    </div>
    <div class="relative pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-brand-primary/20">
      <div v-for="(update, i) in [...updates].reverse()" :key="update.id"
        class="relative mb-6 animate-fade-in last:mb-0"
        :style="{ animationDelay: i * 100 + 'ms' }">
        <div class="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-brand-primary bg-white dark:bg-slate-800"></div>
        <p class="text-sm font-bold text-brand-primary">{{ new Date(update.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ update.text }}</p>
      </div>
    </div>
  </section>
</template>
