<script setup>
import { useFacilityDashboardStore } from '@/stores/facility-dashboard'

const store = useFacilityDashboardStore()
</script>

<template>
  <div class="fixed right-5 top-5 z-[120] space-y-2">
    <TransitionGroup name="facility-toast">
      <div
        v-for="toast in store.toasts"
        :key="toast.id"
        class="min-w-72 rounded-xl border bg-white px-4 py-3 text-sm font-semibold shadow-lg dark:bg-slate-800"
        :class="toast.type === 'error' ? 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400' : 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400'"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.facility-toast-enter-active,
.facility-toast-leave-active {
  transition: all 0.2s ease;
}
.facility-toast-enter-from,
.facility-toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
