<script setup>
import { usePublicToast } from '../../composables/usePublicToast';

const { toasts, removeToast } = usePublicToast();
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2.5 pointer-events-none items-center sm:items-end sm:left-auto sm:right-6 sm:translate-x-0">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2.5 w-full sm:w-auto">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-2.5 bg-slate-900 dark:bg-slate-800 text-white py-3 px-5 rounded-xl shadow-xl text-sm font-semibold border-l-4 min-w-[280px] max-w-[420px] animate-toast-in"
          :class="toast.type === 'success' ? 'border-emerald-500' : 'border-red-500'"
        >
          <svg v-if="toast.type === 'success'" class="w-[18px] h-[18px] text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-[18px] h-[18px] text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="flex-1">{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="text-white/60 hover:text-white transition shrink-0 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-toast-in {
  animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes toastIn {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.toast-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { transform: translateY(12px); opacity: 0; }
.toast-leave-to { transform: translateY(-8px); opacity: 0; }
</style>
