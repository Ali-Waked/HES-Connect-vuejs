<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: 'Upload Images' },
  maxFiles: { type: Number, default: 10 },
});

const emit = defineEmits(['update:modelValue']);

const isDragging = ref(false);

function addFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (props.modelValue.length >= props.maxFiles) return;
  emit('update:modelValue', [...props.modelValue, file]);
}

const onDrop = (e) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files);
  files.forEach(addFile);
};

const onFileChange = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(addFile);
  e.target.value = '';
};

const removeImage = (index) => {
  const updated = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', updated);
};

function getPreviewUrl(file) {
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  return file.image_url || file.url || file;
}

function moveItem(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= props.modelValue.length) return;
  const updated = [...props.modelValue];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  emit('update:modelValue', updated);
};
</script>

<template>
  <div class="space-y-2">
    <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ label }}</label>

    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      <div
        v-for="(file, index) in modelValue"
        :key="index"
        class="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
      >
        <img
          :src="getPreviewUrl(file)"
          class="w-full h-full object-cover"
          alt="Gallery image"
        />
        <div class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
          <button
            type="button"
            class="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition cursor-pointer"
            :disabled="index === 0"
            :class="index === 0 ? 'opacity-30 cursor-not-allowed' : ''"
            @click="moveItem(index, index - 1)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
          </button>
          <button
            type="button"
            class="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition cursor-pointer"
            :disabled="index === modelValue.length - 1"
            :class="index === modelValue.length - 1 ? 'opacity-30 cursor-not-allowed' : ''"
            @click="moveItem(index, index + 1)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <button
            type="button"
            class="p-1.5 bg-rose-500/90 rounded-lg text-white hover:bg-rose-600 transition cursor-pointer"
            @click="removeImage(index)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>

      <div
        v-if="modelValue.length < maxFiles"
        class="relative aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-primary dark:hover:border-brand-primary bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-primary/5 transition-all duration-200 flex flex-col items-center justify-center text-center p-3 cursor-pointer group"
        :class="isDragging ? 'border-brand-primary bg-brand-primary/5' : ''"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="$refs.fileInput.click()"
      >
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="image/*"
          multiple
          @change="onFileChange"
        />
        <span class="material-symbols-outlined text-2xl text-slate-400 group-hover:text-brand-primary transition-colors">add_photo_alternate</span>
        <p class="text-[10px] text-slate-400 mt-1 leading-tight">Add Image</p>
      </div>
    </div>
  </div>
</template>
