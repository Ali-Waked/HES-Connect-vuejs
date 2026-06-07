<script setup>
import { computed } from 'vue';
import { useClinicalStore } from '../../stores/clinical';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import BaseTable from '../../components/dashboard/global/BaseTable.vue';
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue';
import BaseEmptyState from '../../components/dashboard/global/BaseEmptyState.vue';

const store = useClinicalStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'patient', label: 'Patient' },
  { key: 'facility', label: 'Facility' },
  { key: 'prescription', label: 'Prescription' },
  { key: 'date', label: 'Requested At', width: '180px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '200px' }
];

const getStatusVariant = (status) => {
  switch (status) {
    case 'Approved': return 'success';
    case 'Rejected': return 'danger';
    case 'Pending': return 'warning';
    default: return 'neutral';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Medication Requests</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">Verify and approve pharmaceutical dispense requests</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatisticsCard title="Pending" :value="store.clinicalStats.pendingRequests" icon="pending_actions" color="warning" />
      <StatisticsCard title="Approved" :value="store.clinicalStats.approvedRequests" icon="check_circle" color="success" />
      <StatisticsCard title="Total Volume" :value="store.medicationRequests.length" icon="medication" color="primary" />
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :items="store.medicationRequests">
      <template #cell(patient)="{ item }">
        <span class="text-sm font-bold text-slate-900">{{ item.patient }}</span>
      </template>

      <template #cell(prescription)="{ item }">
        <code class="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded">{{ item.prescription }}</code>
      </template>

      <template #cell(status)="{ item }">
        <BaseBadge :variant="getStatusVariant(item.status)">{{ item.status }}</BaseBadge>
      </template>

      <template #cell(actions)="{ item }">
        <div v-if="item.status === 'Pending'" class="flex justify-end gap-2">
          <button 
            @click="store.rejectRequest(item.id)"
            class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            Reject
          </button>
          <button 
            @click="store.approveRequest(item.id)"
            class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition shadow-md shadow-emerald-600/10"
          >
            Approve
          </button>
        </div>
        <div v-else class="text-right">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Processed</span>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState 
          icon="medication_liquid"
          title="No requests" 
          description="Everything is processed and up to date"
        />
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
