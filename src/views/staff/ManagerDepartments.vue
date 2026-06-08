<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Departments</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Manage hospital departments</p>
      </div>
      <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="openAdd">+ Add Department</button>
    </div>

    <DataTable :columns="columns" :items="store.departments" :loading="loading" empty-title="No departments">
      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <button class="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300" @click="openEdit(item.id)">Edit</button>
          <button class="rounded-md border border-red-200 dark:border-red-700 px-3 py-1.5 text-xs text-red-600 dark:text-red-400" @click="confirmDelete(item)">Delete</button>
        </div>
      </template>
    </DataTable>

    <DepartmentFormModal :show="formModal" :department-id="editId" @close="formModal = false; editId = null" />
    <ConfirmModal v-model:modelValue="confirm.visible" title="Delete Department" :message="confirm.message" confirmText="Delete" @confirm="onDelete" @cancel="confirm.visible = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import DataTable from '@/components/staff/shared/DataTable.vue'
import DepartmentFormModal from '@/components/staff/modals/DepartmentFormModal.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'

const store = useStaffStore()
const loading = ref(true)
const formModal = ref(false)
const editId = ref(null)

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'headDoctor', label: 'Head Doctor' },
  { key: 'staffCount', label: 'Staff Count' },
  { key: 'actions', label: 'Actions' }
]

const confirm = ref({ visible: false, item: null, message: '' })

function openAdd() { editId.value = null; formModal.value = true }
function openEdit(id) { editId.value = id; formModal.value = true }

function confirmDelete(item) { confirm.value.item = item; confirm.value.message = `Delete ${item.name} department?`; confirm.value.visible = true }
function onDelete() { if (confirm.value.item) { store.deleteDepartment(confirm.value.item.id); store.showToast('Department deleted', 'success') } }

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
