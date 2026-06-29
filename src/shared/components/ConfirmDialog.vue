<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  message: { type: String, default: 'Are you sure you want to proceed?' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  variant: { type: String, default: 'danger', validator: (v) => ['danger', 'warning', 'info'].includes(v) },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
const open = ref(false)

function show() { open.value = true }
function hide() { open.value = false; emit('cancel') }
function confirm() { emit('confirm') }

defineExpose({ show, hide })

const variantStyles = {
  danger: { icon: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400', button: 'bg-red-600 hover:bg-red-700 text-white' },
  warning: { icon: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', button: 'bg-amber-600 hover:bg-amber-700 text-white' },
  info: { icon: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', button: 'bg-blue-600 hover:bg-blue-700 text-white' },
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="hide">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex items-start gap-4">
            <div class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" :class="variantStyles[variant].icon">
              <svg v-if="variant === 'danger'" class="w-5 h-5" :class="variantStyles[variant].iconColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <svg v-else-if="variant === 'warning'" class="w-5 h-5" :class="variantStyles[variant].iconColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              <svg v-else class="w-5 h-5" :class="variantStyles[variant].iconColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ title }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              @click="hide"
            >
              {{ cancelLabel }}
            </button>
            <button
              class="px-4 py-2.5 text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              :class="variantStyles[variant].button"
              :disabled="loading"
              @click="confirm"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
