<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Documents</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Uploaded facility documents</p>
      </div>
      <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="uploadModal = true">+ Upload Document</button>
    </div>

    <DataTable :columns="columns" :items="store.documents" :loading="loading" empty-title="No documents">
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      <template #cell-fileUrl="{ item }">
        <a href="#" class="text-brand-primary text-sm font-semibold underline">{{ item.fileUrl }}</a>
      </template>
    </DataTable>

    <DocumentUploadModal :show="uploadModal" @close="uploadModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import DataTable from '@/components/staff/shared/DataTable.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import DocumentUploadModal from '@/components/staff/modals/DocumentUploadModal.vue'

const store = useStaffStore()
const loading = ref(true)
const uploadModal = ref(false)

const columns = [
  { key: 'documentType', label: 'Document Type' },
  { key: 'status', label: 'Status' },
  { key: 'fileUrl', label: 'File' },
  { key: 'uploadDate', label: 'Upload Date' }
]

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
