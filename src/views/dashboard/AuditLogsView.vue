<script setup>
import { ref, computed } from 'vue';
import { useAuditStore } from '../../stores/audit';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import BaseTable from '../../components/dashboard/global/BaseTable.vue';
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue';
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue';
import BaseDialog from '../../components/dashboard/global/BaseDialog.vue';
import JsonViewer from '../../components/dashboard/global/JsonViewer.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAuditStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'action', label: 'Action', width: '120px' },
  { key: 'table_name', label: 'Table', width: '150px' },
  { key: 'record_id', label: 'Record ID', width: '120px' },
  { key: 'user', label: 'User' },
  { key: 'date', label: 'Date & Time', width: '180px' },
  { key: 'actions', label: 'Details', align: 'right', width: '80px' }
];

const searchQuery = ref('');
const selectedLog = ref(null);
const showDetailModal = ref(false);

const filteredLogs = computed(() => {
  return store.logs.filter(l => {
    return l.user.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           l.table_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
           l.action.toLowerCase().includes(searchQuery.value.toLowerCase());
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
});

const getActionVariant = (action) => {
  switch (action) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DELETE': return 'danger';
    case 'LOGIN': return 'info';
    default: return 'neutral';
  }
};

const viewDetails = (log) => {
  selectedLog.value = log;
  showDetailModal.value = true;
};
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.auditLogs') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ t('pageTitles.auditLogsDesc') }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard title="Actions Today" :value="store.auditStats.actionsToday" icon="history" color="primary" />
      <StatisticsCard title="Most Modified" :value="store.auditStats.mostModified" icon="table_chart" color="info" />
      <StatisticsCard title="System Integrity" value="100%" icon="verified_user" color="success" />
      <StatisticsCard title="Total Logs" :value="store.logs.length" icon="analytics" color="neutral" />
    </div>

    <!-- Controls -->
    <div class="flex flex-col md:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search by user, table, or action..." />
      <div class="flex gap-2">
        <input type="date" class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
        <button class="px-4 py-2 bg-slate-900 dark:bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-brand-primary-hover transition">Filter</button>
      </div>
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :items="filteredLogs">
      <template #cell(action)="{ item }">
        <BaseBadge :variant="getActionVariant(item.action)">{{ item.action }}</BaseBadge>
      </template>

      <template #cell(table_name)="{ item }">
        <code class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ item.table_name }}</code>
      </template>

      <template #cell(date)="{ item }">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ new Date(item.date).toLocaleString() }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <button 
          @click="viewDetails(item)"
          class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </button>
      </template>
    </BaseTable>

    <!-- Detail Modal -->
    <BaseDialog 
      :show="showDetailModal" 
      title="Audit Log Details" 
      size="lg"
      @close="showDetailModal = false"
    >
      <div v-if="selectedLog" class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Action Type</p>
            <BaseBadge :variant="getActionVariant(selectedLog.action)">{{ selectedLog.action }}</BaseBadge>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Target Table</p>
            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedLog.table_name }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payload Changes</label>
          <JsonViewer :data="selectedLog.details" />
        </div>

        <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div>
            <p class="text-xs text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest">Modified By</p>
            <p class="text-sm font-bold text-blue-900 dark:text-blue-200">{{ selectedLog.user }}</p>
          </div>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
