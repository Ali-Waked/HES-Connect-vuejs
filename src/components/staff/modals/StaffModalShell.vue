<script setup>
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, required: true },
  width: { type: String, default: 'max-w-xl' }
});

defineEmits(['close']);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs" @click.self="$emit('close')">
    <section class="max-h-[90vh] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl" :class="width">
      <header class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-5 py-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">{{ title }}</h2>
        <button class="rounded-lg p-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300" @click="$emit('close')">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </header>
      <div class="max-h-[calc(90vh-64px)] overflow-y-auto p-5">
        <slot />
      </div>
    </section>
  </div>
</template>
