<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMedicinesStore } from '../../../stores/medicines';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import BaseTable from '../global/BaseTable.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BasePagination from '../global/BasePagination.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import MedicineFormModal from './MedicineFormModal.vue';

const router = useRouter();
const { t } = useI18n();
const store = useMedicinesStore();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();

const columns = [
  { key: 'image', label: 'Image', width: '100px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'created_at', label: 'Created At', width: '180px', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right', width: '100px' }
];

const searchQuery = ref('');
const sortField = ref('created_at');
const sortOrder = ref('desc');
const rowsPerPage = ref(10);

let debounceTimer = null;

function fetchData() {
  const params = {
    page: store.pagination.current_page || 1,
    per_page: rowsPerPage.value,
  }
  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }
  if (sortField.value) {
    params.sort_by = sortField.value
    params.sort_order = sortOrder.value
  }
  store.fetchMedicines(params)
}

watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.pagination.current_page = 1
    fetchData()
  }, 400)
})

function onPageChange(page) {
  store.pagination.current_page = page
  fetchData()
}

function onPerPageChange(val) {
  rowsPerPage.value = parseInt(val)
  store.pagination.current_page = 1
  fetchData()
}

function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
  fetchData()
}

const showFormModal = ref(false);
const selectedMedicine = ref(null);
const editUuid = ref(null);
const showDeleteConfirm = ref(false);
const previewImage = ref(null);

const openAddModal = () => {
  selectedMedicine.value = null;
  editUuid.value = null;
  showFormModal.value = true;
};

const openEditModal = async (medicine) => {
  editUuid.value = medicine.uuid;
  await store.fetchMedicine(medicine.uuid)
  selectedMedicine.value = { ...store.medicine, uuid: medicine.uuid };
  showFormModal.value = true;
};

const confirmDelete = (medicine) => {
  selectedMedicine.value = medicine;
  showDeleteConfirm.value = true;
};

const onFormModalClose = () => {
  showFormModal.value = false;
  fetchData();
};

const handleDelete = async () => {
  if (selectedMedicine.value) {
    await store.deleteMedicine(selectedMedicine.value.uuid);
    showDeleteConfirm.value = false;
    selectedMedicine.value = null;
  }
};

const truncate = (text, length = 80) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <BaseSearch v-model="searchQuery" :placeholder="t('medicines.searchPlaceholder')" />
      <div class="flex items-center gap-2">
        <select
          class="min-w-[100px] p-2.5 pr-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] transition"
          style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
          :value="rowsPerPage" @change="onPerPageChange($event.target.value)"
        >
          <option value="10">10 / page</option>
          <option value="15">15 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
        </select>
        <button
          @click="openAddModal"
          class="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer shrink-0"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          Add Medicine
        </button>
      </div>
    </div>

    <BaseTable :columns="columns" :items="store.medicines" :loading="store.loading">
      <template #cell(image)="{ item }">
        <button
          v-if="item.image_url"
          @click="previewImage = item.image_url"
          class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer"
        >
          <img :src="item.image_url" class="w-full h-full object-cover" />
        </button>
        <div v-else class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">medical_services</span>
        </div>
      </template>

      <template #cell(name)="{ item }">
        <div class="flex items-center gap-3">
          <button
            @click="router.push(`/platform/medicines/${item.uuid}`)"
            class="text-sm font-semibold text-slate-900 dark:text-white hover:text-brand-primary transition text-left cursor-pointer"
          >
            {{ localField(item, 'name') }}
          </button>
        </div>
      </template>

      <template #cell(description)="{ item }">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ truncate(localField(item, 'description')) }}</span>
      </template>

      <template #cell(created_at)="{ item }">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1.5">
          <button
            @click="openEditModal(item)"
            class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
            title="Edit"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            @click="confirmDelete(item)"
            class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer"
            title="Delete"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

    <BasePagination
      v-if="store.pagination.total > 0"
      :current-page="store.pagination.current_page || 1"
      :total-pages="store.pagination.last_page || 1"
      :total-items="store.pagination.total || 0"
      :items-per-page="rowsPerPage"
      @change="onPageChange"
    />

    <MedicineFormModal :show="showFormModal" :medicine="selectedMedicine" @close="onFormModalClose" />

    <Teleport to="body">
      <div
        v-if="previewImage"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
        @click.self="previewImage = null"
      >
        <div class="relative max-w-3xl w-full">
          <button
            class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer z-10 transition"
            @click="previewImage = null"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img :src="previewImage" class="w-full rounded-xl shadow-2xl" alt="Medicine image preview" />
        </div>
      </div>
    </Teleport>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Delete Medicine"
      :message="`Are you sure you want to delete <strong>${selectedMedicine ? localField(selectedMedicine, 'name') : ''}</strong>? This action cannot be undone.`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
