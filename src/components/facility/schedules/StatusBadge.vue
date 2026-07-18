<script setup>
defineProps({
  active: { type: Boolean, default: true }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
    :class="active
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
    {{ active ? 'Active' : 'Inactive' }}
  </span>
</template>
