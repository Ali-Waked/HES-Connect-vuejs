<script setup>
import { ref } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  compact: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['upload']);
const fileInput = ref(null);
const dragging = ref(false);
const error = ref('');

function openPicker() {
  fileInput.value?.click();
}

function emitFile(file) {
  error.value = '';

  if (!file) return;
  if (!file.type.startsWith('image/')) {
    error.value = 'Upload an image file.';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image must be smaller than 5 MB.';
    return;
  }

  emit('upload', file);
}

function onInput(event) {
  emitFile(event.target.files?.[0]);
  event.target.value = '';
}

function onDrop(event) {
  dragging.value = false;
  emitFile(event.dataTransfer.files?.[0]);
}
</script>

<template>
  <div>
    <button
      type="button"
      class="group flex items-center justify-center gap-2 border border-dashed border-white/50 bg-white/20 text-white shadow-sm backdrop-blur transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-70"
      :class="compact ? 'h-10 w-10 rounded-full' : 'rounded-xl px-4 py-2 text-sm font-semibold'"
      :disabled="loading"
      @click.stop="openPicker"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="material-symbols-outlined text-[20px]">{{ loading ? 'progress_activity' : 'cloud_upload' }}</span>
      <span v-if="!compact">{{ loading ? 'Uploading...' : label }}</span>
    </button>

    <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="onInput" />
    <p v-if="error" class="mt-2 text-xs font-semibold text-rose-100">{{ error }}</p>
  </div>
</template>
