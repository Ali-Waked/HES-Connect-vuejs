<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({ pending: 0, approved: 0, rejected: 0, cancelled: 0 })
  }
})

const cards = [
  { key: 'pending', label: 'Pending', icon: 'clock', color: 'amber' },
  { key: 'approved', label: 'Approved', icon: 'check_circle', color: 'emerald' },
  { key: 'rejected', label: 'Rejected', icon: 'cancel', color: 'red' },
  { key: 'cancelled', label: 'Cancelled', icon: 'block', color: 'slate' },
]

const colorClasses = {
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
}
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4"
    >
      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="colorClasses[card.color]">
        <span class="material-symbols-outlined text-[20px]">{{ card.icon }}</span>
      </div>
      <div>
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ card.label }}</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats[card.key] || 0 }}</p>
      </div>
    </div>
  </div>
</template>
