<script setup>
import { ref, computed } from 'vue';
import { useTagsStore } from '../../../stores/tags';
import BaseTable from '../global/BaseTable.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import TagFormModal from './TagFormModal.vue';

const store = useTagsStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Tag' },
  { key: 'count', label: 'Usage Count', width: '150px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' }
];

const searchQuery = ref('');

const filteredTags = computed(() => {
  return store.tags.filter(t => {
    return t.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  }).sort((a, b) => b.count - a.count);
});

// Actions
const selectedTag = ref(null);
const showFormModal = ref(false);
const showDeleteConfirm = ref(false);

const openAddModal = () => {
  selectedTag.value = null;
  showFormModal.value = true;
};

const openEditModal = (tag) => {
  selectedTag.value = tag;
  showFormModal.value = true;
};

const confirmDelete = (tag) => {
  selectedTag.value = tag;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedTag.value) {
    store.deleteTag(selectedTag.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search tags..." />
      <button 
        @click="openAddModal"
        class="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Tag
      </button>
    </div>

    <BaseTable :columns="columns" :items="filteredTags">
      <template #cell(name)="{ item }">
        <span class="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
          #{{ item.name }}
        </span>
      </template>

      <template #cell(count)="{ item }">
        <span class="text-sm font-semibold text-slate-600">{{ item.count }} articles</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="openEditModal(item)"
            class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Edit"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState v-if="searchQuery" title="No matching tags" @reset="searchQuery = ''" />
        <BaseEmptyState v-else icon="tag" title="No tags defined" />
      </template>
    </BaseTable>

    <TagFormModal 
      :show="showFormModal"
      :tag="selectedTag"
      @close="showFormModal = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Tag"
      :message="`Are you sure you want to delete tag <strong>#${selectedTag?.name}</strong>? This will remove it from all articles.`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
