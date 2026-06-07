<script setup>
import { computed } from 'vue';
import { useClinicalStore } from '../../stores/clinical';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import BaseTable from '../../components/dashboard/global/BaseTable.vue';
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue';
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue';

const store = useClinicalStore();

const columns = [
  { key: 'id', label: 'RX ID', width: '120px' },
  { key: 'patient', label: 'Patient' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'medicines', label: 'Prescribed Items' },
  { key: 'created_at', label: 'Date', width: '150px' },
  { key: 'actions', label: 'Details', align: 'right', width: '80px' }
];

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Prescriptions</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">History of all digital prescriptions issued across clinical departments</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard title="Total Issued" :value="store.clinicalStats.totalPrescriptions" icon="description" color="primary" />
      <StatisticsCard title="This Month" value="12" icon="event" color="info" />
      <StatisticsCard title="Active Course" value="8" icon="play_circle" color="success" />
      <StatisticsCard title="Completed" value="45" icon="done_all" color="neutral" />
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :items="store.prescriptions">
      <template #cell(id)="{ item }">
        <span class="text-sm font-black text-slate-900">{{ item.id }}</span>
      </template>

      <template #cell(medicines)="{ item }">
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="(med, idx) in item.medicines" 
            :key="idx"
            class="px-1.5 py-0.5 bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-100 rounded uppercase tracking-tighter"
          >
            {{ med.name }} ({{ med.dose }})
          </span>
        </div>
      </template>

      <template #cell(created_at)="{ item }">
        <span class="text-xs text-slate-500 font-medium">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell(actions)>
        <button class="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </button>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
