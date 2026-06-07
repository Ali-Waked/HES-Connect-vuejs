<script setup>
import { ref, computed } from 'vue';
import { useAccessStore } from '../../../stores/access';
import BaseTable from '../global/BaseTable.vue';
import BaseBadge from '../global/BaseBadge.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import RoleFormModal from './RoleFormModal.vue';
import RoleDetailDialog from './RoleDetailDialog.vue';

const store = useAccessStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Role Name' },
  { key: 'permissions', label: 'Permissions Count', width: '180px' },
  { key: 'user_count', label: 'Assigned Users', width: '150px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '150px' }
];

const searchQuery = ref('');

const filteredRoles = computed(() => {
  return store.roles.filter(r => {
    return r.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// Actions
const selectedRole = ref(null);
const showFormModal = ref(false);
const showDetailDialog = ref(false);
const showDeleteConfirm = ref(false);

const openAddModal = () => {
  selectedRole.value = null;
  showFormModal.value = true;
};

const openEditModal = (role) => {
  selectedRole.value = role;
  showFormModal.value = true;
};

const viewRole = (role) => {
  selectedRole.value = role;
  showDetailDialog.value = true;
};

const confirmDelete = (role) => {
  selectedRole.value = role;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedRole.value) {
    store.deleteRole(selectedRole.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search roles..." />
      <button 
        @click="openAddModal"
        class="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Role
      </button>
    </div>

    <BaseTable :columns="columns" :items="filteredRoles">
      <template #cell(name)="{ item }">
        <span class="text-sm font-bold text-slate-900">{{ item.name }}</span>
      </template>

      <template #cell(permissions)="{ item }">
        <BaseBadge variant="info">{{ item.permissions.length }} Permissions</BaseBadge>
      </template>

      <template #cell(user_count)="{ item }">
        <span class="text-sm font-semibold text-slate-600">{{ item.user_count }} users</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="viewRole(item)"
            class="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
            title="View Details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
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
        <BaseEmptyState 
          v-if="searchQuery"
          title="No roles found" 
          @reset="searchQuery = ''"
        />
        <BaseEmptyState 
          v-else
          icon="group"
          title="No roles defined" 
        />
      </template>
    </BaseTable>

    <RoleFormModal 
      :show="showFormModal"
      :role="selectedRole"
      @close="showFormModal = false"
    />

    <RoleDetailDialog 
      :show="showDetailDialog"
      :role="selectedRole"
      @close="showDetailDialog = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Role"
      :message="`Are you sure you want to delete role <strong>${selectedRole?.name}</strong>? This action may affect users assigned to this role.`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
