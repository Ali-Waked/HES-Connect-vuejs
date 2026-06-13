<script setup>
import { ref, computed } from 'vue';
import { useReportsStore } from '../../../stores/reports';
import BaseTable from '../global/BaseTable.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import ReportDetailDialog from './ReportDetailDialog.vue';

const store = useReportsStore();

const columns = [
  { key: 'id', label: 'ID', width: '120px' },
  { key: 'type', label: 'Report Type' },
  { key: 'generated_at', label: 'Generated At', width: '250px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' }
];

const searchQuery = ref('');

const filteredReports = computed(() => {
  return store.reports.filter(r => {
    return r.type.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           r.id.toLowerCase().includes(searchQuery.value.toLowerCase());
  }).sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

// Actions
const selectedReport = ref(null);
const showDetailDialog = ref(false);
const showDeleteConfirm = ref(false);

const viewReport = (report) => {
  selectedReport.value = report;
  showDetailDialog.value = true;
};

const confirmDelete = (report) => {
  selectedReport.value = report;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedReport.value) {
    store.deleteReport(selectedReport.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search by type or ID..." />
    </div>

    <BaseTable :columns="columns" :items="filteredReports">
      <template #cell(generated_at)="{ item }">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ formatDate(item.generated_at) }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="viewReport(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
            title="View Details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
            title="Delete Report"
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
          title="No reports found" 
          description="Try a different search term"
          @reset="searchQuery = ''"
        />
        <BaseEmptyState 
          v-else
          icon="assessment"
          title="No reports generated" 
          description="Reports will appear here once they are generated"
        />
      </template>
    </BaseTable>

    <ReportDetailDialog 
      :show="showDetailDialog"
      :report="selectedReport"
      @close="showDetailDialog = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Report"
      :message="`Are you sure you want to delete report <strong>${selectedReport?.id}</strong>?`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
