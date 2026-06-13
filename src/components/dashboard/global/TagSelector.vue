<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  tags: { type: Array, required: true },
  label: { type: String, default: 'Tags' }
});

const emit = defineEmits(['update:modelValue', 'create']);

const { locale } = useI18n();

const isOpen = ref(false);
const searchQuery = ref('');

function tagId(tag) {
  return tag.uuid || tag.id;
}

function getTagName(tag) {
  if (!tag?.name) return '';
  if (typeof tag.name === 'string') return tag.name;
  return tag.name[locale.value] || tag.name.en || tag.name.ar || '';
}

const filteredTags = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return props.tags.filter(t => {
    const alreadySelected = props.modelValue.some(id => id === tagId(t));
    return getTagName(t).toLowerCase().includes(query) && !alreadySelected;
  });
});

const selectedTagsData = computed(() => {
  return props.modelValue.map(id => props.tags.find(t => tagId(t) === id)).filter(Boolean);
});

const selectTag = (tag) => {
  const current = [...props.modelValue];
  current.push(tagId(tag));
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
    <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ label }}</label>
    
    <div class="flex flex-wrap gap-1.5 mb-2">
      <span 
        v-for="tag in selectedTagsData" 
        :key="tag.id"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[11px] font-bold rounded-full border border-brand-primary/20"
      >
        #{{ getTagName(tag) }}
        <button type="button" @click="removeTag(tagId(tag))" class="hover:text-rose-500 transition-colors">
          <span class="material-symbols-outlined text-[14px]">close</span>
        </button>
      </span>
    </div>

    <div class="relative">
      <div 
        class="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/10 transition cursor-text"
        @click="isOpen = true"
      >
        <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg">tag</span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search or create tags..."
          class="flex-grow bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100"
          @focus="isOpen = true"
          @keydown.enter.prevent="handleCreate"
        />
        <button 
          v-if="searchQuery && !filteredTags.find(t => getTagName(t).toLowerCase() === searchQuery.toLowerCase())"
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
        class="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto py-2 custom-scrollbar"
        v-click-outside="() => isOpen = false"
      >
        <button 
          v-for="tag in filteredTags" 
          :key="tag.id"
          type="button"
          @click="selectTag(tag)"
          class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-primary flex items-center justify-between group transition-colors"
        >
          <span>#{{ getTagName(tag) }}</span>
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
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
</style>
