<script setup>
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value)
  }
});

defineEmits(['close']);

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-[calc(100vw-2rem)]'
};
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 sm:p-6"
      @click.self="$emit('close')"
    >
      <div 
        class="bg-white rounded-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-modal-enter flex flex-col max-h-full"
        :class="sizeClasses[size]"
      >
        <!-- Header -->
        <div class="px-6 py-4 flex justify-between items-center border-b border-slate-100 shrink-0">
          <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
          <button 
            class="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition flex items-center justify-center"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="p-6 overflow-y-auto grow">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-modal-enter {
  animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
