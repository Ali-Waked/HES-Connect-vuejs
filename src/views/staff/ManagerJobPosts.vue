<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Job Posts</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Manage job openings</p>
      </div>
      <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="openAdd">+ Add Job Post</button>
    </div>

    <DataTable :columns="columns" :items="store.jobPosts" :loading="loading" empty-title="No job posts">
      <template #cell-applyMethod="{ item }">
        <span class="material-symbols-outlined text-[18px]" :class="item.applyMethod === 'email' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'">{{ item.applyMethod === 'email' ? 'mail' : 'link' }}</span>
      </template>
      <template #cell-endDate="{ item }">
        <span :class="isNearEnd(item.endDate) ? 'text-red-600 font-bold' : ''">{{ item.endDate }}</span>
      </template>
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <button class="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300" @click="openEdit(item.id)">Edit</button>
          <button class="rounded-md border border-red-200 dark:border-red-700 px-3 py-1.5 text-xs text-red-600 dark:text-red-400" @click="confirmDelete(item)">Delete</button>
        </div>
      </template>
    </DataTable>

    <JobPostFormModal :show="formModal" :post-id="editId" @close="formModal = false; editId = null" />
    <ConfirmModal v-model:modelValue="confirm.visible" title="Delete Job Post" :message="confirm.message" confirmText="Delete" @confirm="onDelete" @cancel="confirm.visible = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import DataTable from '@/components/staff/shared/DataTable.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import JobPostFormModal from '@/components/staff/modals/JobPostFormModal.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'

const store = useStaffStore()
const loading = ref(true)
const formModal = ref(false)
const editId = ref(null)

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'applyMethod', label: 'Apply' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

const confirm = ref({ visible: false, item: null, message: '' })

function isNearEnd(date) {
  const diff = (new Date(date) - new Date()) / 86400000
  return diff < 7 && diff >= 0
}

function openAdd() { editId.value = null; formModal.value = true }
function openEdit(id) { editId.value = id; formModal.value = true }

function confirmDelete(item) { confirm.value.item = item; confirm.value.message = `Delete ${item.title}?`; confirm.value.visible = true }
function onDelete() { if (confirm.value.item) { store.deleteJobPost(confirm.value.item.id); store.showToast('Job post deleted', 'success') } }

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
