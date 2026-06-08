<script setup>
import { useStaffStore } from '../../../stores/useStaffStore';

const store = useStaffStore();
</script>

<template>
  <div class="fixed right-5 top-5 z-[120] space-y-2">
    <TransitionGroup name="staff-toast">
      <div
        v-for="toast in store.toasts"
        :key="toast.id"
        class="min-w-72 rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold shadow-lg"
        :class="toast.type === 'error' ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.staff-toast-enter-active,
.staff-toast-leave-active {
  transition: all 0.2s ease;
}
.staff-toast-enter-from,
.staff-toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
