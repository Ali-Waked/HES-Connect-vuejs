<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: 'Upload Files' },
  maxFiles: { type: Number, default: 5 },
  accept: { type: String, default: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar' },
});

const emit = defineEmits(['update:modelValue']);

const isDragging = ref(false);
const fileInput = ref(null);

function addFile(file) {
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

const removeFile = (index) => {
  const updated = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', updated);
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileName(file) {
  if (file instanceof File) return file.name;
  return file.name || file.file_name || file.url || 'Unknown file';
}

function getFileSize(file) {
  if (file instanceof File) return file.size;
  return file.size || file.file_size || 0;
}

function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

const extColors = {
  pdf: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  doc: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  docx: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  xls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  xlsx: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  ppt: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  pptx: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  txt: 'text-slate-600 bg-slate-50 dark:bg-slate-800',
  zip: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  rar: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  default: 'text-slate-600 bg-slate-50 dark:bg-slate-800',
};
</script>

<template>
  <div class="space-y-2">
    <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ label }}</label>

    <div class="space-y-2">
      <div
        v-for="(file, index) in modelValue"
        :key="index"
        class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 group hover:border-slate-300 dark:hover:border-slate-600 transition"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase"
            :class="extColors[getFileExtension(getFileName(file))] || extColors.default"
          >
            {{ getFileExtension(getFileName(file)) || '?' }}
          </span>
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ getFileName(file) }}</p>
            <p v-if="getFileSize(file)" class="text-xs text-slate-400 dark:text-slate-500">{{ formatSize(getFileSize(file)) }}</p>
          </div>
        </div>
        <button
          type="button"
          class="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer"
          @click="removeFile(index)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div v-if="modelValue.length < maxFiles" class="flex items-center justify-center">
        <div
          class="relative w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-primary dark:hover:border-brand-primary bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-primary/5 transition-all duration-200 flex flex-col items-center justify-center text-center px-6 py-5 cursor-pointer group"
          :class="isDragging ? 'border-brand-primary bg-brand-primary/5' : ''"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="fileInput?.click()"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            :accept="accept"
            multiple
            @change="onFileChange"
          />
          <span class="material-symbols-outlined text-2xl text-slate-400 group-hover:text-brand-primary transition-colors">note_add</span>
          <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">Click to upload or drag and drop</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">PDF, DOC, XLS, PPT, TXT, ZIP (Max {{ maxFiles }} files)</p>
        </div>
      </div>
    </div>
  </div>
</template>
