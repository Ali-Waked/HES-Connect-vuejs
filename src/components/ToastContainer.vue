<script setup>
import { useDashboardStore } from '../stores/dashboard';

const store = useDashboardStore();
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
    <TransitionGroup 
      name="toast-list" 
      tag="div" 
      class="flex flex-col gap-2.5"
    >
      <div 
        v-for="toast in store.toasts" 
        :key="toast.id" 
        class="pointer-events-auto flex items-center gap-2.5 bg-slate-900 text-white py-3 px-5 rounded-lg shadow-xl text-sm font-semibold border-l-4 min-w-[280px]"
        :class="toast.type === 'success' ? 'border-emerald-500' : 'border-red-500'"
      >
        <!-- Success Icon -->
        <svg 
          v-if="toast.type === 'success'" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke-width="2" 
          stroke="currentColor" 
          class="w-[18px] h-[18px] text-emerald-400"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <!-- Error/Delete Icon -->
        <svg 
          v-else 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke-width="2" 
          stroke="currentColor" 
          class="w-[18px] h-[18px] text-red-400"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        
        <span>{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-list-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-list-leave-active {
  transition: all 0.2s ease-in;
}
.toast-list-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-list-leave-to {
  transform: translateX(50%);
  opacity: 0;
}
</style>
