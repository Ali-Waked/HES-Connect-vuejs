<script setup>
import { ref, computed } from 'vue';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useMedicinesStore } from '../../../stores/medicines';
import BaseTable from '../global/BaseTable.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import MedicineFormModal from './MedicineFormModal.vue';
import MedicineDetailDialog from './MedicineDetailDialog.vue';

const store = useMedicinesStore();
const { localField } = useLocaleField();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'image', label: 'Image', width: '100px' },
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'created_at', label: 'Created At', width: '180px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '150px' }
];

const searchQuery = ref('');

const filteredMedicines = computed(() => {
  return store.medicines.filter(m => {
    return localField(m, 'name').toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           localField(m, 'description').toLowerCase().includes(searchQuery.value.toLowerCase());
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const truncate = (text, length = 80) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Actions
const selectedMedicine = ref(null);
const showFormModal = ref(false);
const showDetailDialog = ref(false);
const showDeleteConfirm = ref(false);

const openAddModal = () => {
  selectedMedicine.value = null;
  showFormModal.value = true;
};

const openEditModal = (medicine) => {
  selectedMedicine.value = medicine;
  showFormModal.value = true;
};

const viewMedicine = (medicine) => {
  selectedMedicine.value = medicine;
  showDetailDialog.value = true;
};

const confirmDelete = (medicine) => {
  selectedMedicine.value = medicine;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedMedicine.value) {
    store.deleteMedicine(selectedMedicine.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search medicines..." />
      <button 
        @click="openAddModal"
        class="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer shrink-0"
      >
        <span class="material-symbols-outlined text-lg">add</span>
        Add Medicine
      </button>
    </div>

    <BaseTable :columns="columns" :items="filteredMedicines">
      <template #cell(name)="{ item }">
        <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(item, 'name') }}</span>
      </template>

      <template #cell(image)="{ item }">
        <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
          <span v-else class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">medical_services</span>
        </div>
      </template>

      <template #cell(description)="{ item }">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ truncate(localField(item, 'description')) }}</span>
      </template>

      <template #cell(created_at)="{ item }">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="viewMedicine(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
            title="View Details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            @click="openEditModal(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Edit"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
            title="Delete"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState 
          v-if="searchQuery"
          title="No medicines found" 
          description="Try a different search term"
          @reset="searchQuery = ''"
        />
        <BaseEmptyState 
          v-else
          icon="pill"
          title="No medicines registered" 
          description="Click 'Add Medicine' to create your first entry"
        />
      </template>
    </BaseTable>

    <MedicineFormModal 
      :show="showFormModal"
      :medicine="selectedMedicine"
      @close="showFormModal = false"
    />

    <MedicineDetailDialog 
      :show="showDetailDialog"
      :medicine="selectedMedicine"
      @close="showDetailDialog = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Medicine"
      :message="`Are you sure you want to delete <strong>${localField(selectedMedicine, 'name')}</strong>? This action cannot be undone.`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
