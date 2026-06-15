<script setup>
defineProps({
  type: { type: String, default: 'error' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  dismissible: { type: Boolean, default: false },
})

defineEmits(['dismiss'])
</script>

<template>
  <div
    class="rounded-xl border p-4 flex items-start gap-3 transition-all duration-200"
    :class="[
      type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
      type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
      type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
      'bg-blue-50 border-blue-200 text-blue-700'
    ]"
    role="alert"
  >
    <div class="shrink-0 mt-0.5">
      <svg v-if="type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
      </svg>
      <svg v-else-if="type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
      </svg>
      <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p v-if="title" class="text-sm font-semibold">{{ title }}</p>
      <p v-if="message" class="text-sm mt-0.5 opacity-90">{{ message }}</p>
      <slot />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
