<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: [String, File], default: null },
  label: { type: String, default: 'Upload Image' },
  aspectRatio: { type: String, default: 'aspect-video' }
});

const emit = defineEmits(['update:modelValue']);

const isDragging = ref(false);
const previewUrl = ref(null);
let objectUrl = null;

function revokeObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

watch(() => props.modelValue, (val) => {
  revokeObjectUrl();
  if (val instanceof File) {
    previewUrl.value = URL.createObjectURL(val);
    objectUrl = previewUrl.value;
  } else if (typeof val === 'string' && val) {
    previewUrl.value = val;
  } else {
    previewUrl.value = null;
  }
}, { immediate: true });

onUnmounted(() => {
  revokeObjectUrl();
});

const handleFile = (file) => {
  if (!file || !file.type.startsWith('image/')) return;

  revokeObjectUrl();
  previewUrl.value = URL.createObjectURL(file);
  objectUrl = previewUrl.value;
  emit('update:modelValue', file);
};

const onDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  handleFile(file);
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  handleFile(file);
};

const removeImage = () => {
  revokeObjectUrl();
  previewUrl.value = null;
  emit('update:modelValue', null);
};
</script>

<template>
  <div class="space-y-2">
    <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ label }}</label>

    <div
      v-if="!previewUrl"
      class="relative border-2 border-dashed rounded-xl transition-all duration-200 group"
      :class="[
        aspectRatio,
        isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input
        type="file"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        accept="image/*"
        @change="onFileChange"
      />
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500 group-hover:text-brand-primary transition-colors">cloud_upload</span>
        <p class="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Click to upload or drag and drop</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG or WEBP (Max 2MB)</p>
      </div>
    </div>

    <div v-else class="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group" :class="aspectRatio">
      <img :src="previewUrl" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <label class="cursor-pointer p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-50 transition shadow-lg">
          <span class="material-symbols-outlined text-xl">edit</span>
          <input type="file" class="hidden" accept="image/*" @change="onFileChange" />
        </label>
        <button
          @click="removeImage"
          class="p-2 bg-white rounded-lg text-rose-600 hover:bg-rose-50 transition shadow-lg cursor-pointer"
        >
          <span class="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
