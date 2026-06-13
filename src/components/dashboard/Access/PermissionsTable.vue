<script setup>
import { ref, computed } from 'vue';
import { useAccessStore } from '../../../stores/access';
import BaseTable from '../global/BaseTable.vue';
import BaseBadge from '../global/BaseBadge.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import PermissionFormModal from './PermissionFormModal.vue';

const store = useAccessStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Permission Slug' },
  { key: 'description', label: 'Description' },
  { key: 'roles_count', label: 'Used In Roles', width: '150px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' }
];

const searchQuery = ref('');

const filteredPermissions = computed(() => {
  return store.permissions.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           p.description.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const getRolesForPermission = (permId) => {
  return store.roles.filter(r => r.permissions.includes(permId));
};

// Actions
const selectedPerm = ref(null);
const showFormModal = ref(false);
const showDeleteConfirm = ref(false);

const openAddModal = () => {
  selectedPerm.value = null;
  showFormModal.value = true;
};

const openEditModal = (perm) => {
  selectedPerm.value = perm;
  showFormModal.value = true;
};

const confirmDelete = (perm) => {
  selectedPerm.value = perm;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedPerm.value) {
    store.deletePermission(selectedPerm.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search permissions..." />
      <button 
        @click="openAddModal"
        class="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Permission
      </button>
    </div>

    <BaseTable :columns="columns" :items="filteredPermissions">
      <template #cell(name)="{ item }">
        <code class="text-xs font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded">{{ item.name }}</code>
      </template>

      <template #cell(description)="{ item }">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ item.description }}</span>
      </template>

      <template #cell(roles_count)="{ item }">
        <span class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ getRolesForPermission(item.id).length }} roles</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="openEditModal(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Edit"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
            title="Delete"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState v-if="searchQuery" title="No matching permissions" @reset="searchQuery = ''" />
        <BaseEmptyState v-else icon="vpn_key" title="No permissions defined" />
      </template>
    </BaseTable>

    <PermissionFormModal 
      :show="showFormModal"
      :permission="selectedPerm"
      @close="showFormModal = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Permission"
      :message="`Are you sure you want to delete permission <strong>${selectedPerm?.name}</strong>? This will remove it from all roles.`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
