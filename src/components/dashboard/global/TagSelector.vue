<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  tags: { type: Array, required: true },
  label: { type: String, default: 'Tags' }
});

const emit = defineEmits(['update:modelValue', 'create']);

const isOpen = ref(false);
const searchQuery = ref('');

const filteredTags = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return props.tags.filter(t => t.name.toLowerCase().includes(query) && !props.modelValue.includes(t.id));
});

const selectedTagsData = computed(() => {
  return props.modelValue.map(id => props.tags.find(t => t.id === id)).filter(Boolean);
});

const selectTag = (tag) => {
  const current = [...props.modelValue];
  current.push(tag.id);
  emit('update:modelValue', current);
  searchQuery.value = '';
};

const removeTag = (id) => {
  emit('update:modelValue', props.modelValue.filter(tagId => tagId !== id));
};

const handleCreate = () => {
  if (searchQuery.value.trim()) {
    emit('create', searchQuery.value.trim());
    searchQuery.value = '';
  }
};
</script>

<template>
  <div class="space-y-2">
    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">{{ label }}</label>
    
    <div class="flex flex-wrap gap-1.5 mb-2">
      <span 
        v-for="tag in selectedTagsData" 
        :key="tag.id"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[11px] font-bold rounded-full border border-brand-primary/20"
      >
        #{{ tag.name }}
        <button type="button" @click="removeTag(tag.id)" class="hover:text-rose-500 transition-colors">
          <span class="material-symbols-outlined text-[14px]">close</span>
        </button>
      </span>
    </div>

    <div class="relative">
      <div 
        class="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/10 transition cursor-text"
        @click="isOpen = true"
      >
        <span class="material-symbols-outlined text-slate-400 text-lg">tag</span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search or create tags..."
          class="flex-grow bg-transparent outline-none text-sm"
          @focus="isOpen = true"
          @keydown.enter.prevent="handleCreate"
        />
        <button 
          v-if="searchQuery && !filteredTags.find(t => t.name.toLowerCase() === searchQuery.toLowerCase())"
          type="button"
          @click="handleCreate"
          class="shrink-0 text-[10px] font-black bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600 transition"
        >
          CREATE
        </button>
      </div>

      <!-- Dropdown -->
      <div 
        v-if="isOpen && (filteredTags.length > 0)" 
        class="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-2 custom-scrollbar"
        v-click-outside="() => isOpen = false"
      >
        <button 
          v-for="tag in filteredTags" 
          :key="tag.id"
          type="button"
          @click="selectTag(tag)"
          class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-primary flex items-center justify-between group transition-colors"
        >
          <span>#{{ tag.name }}</span>
          <span class="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100">add_circle</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
