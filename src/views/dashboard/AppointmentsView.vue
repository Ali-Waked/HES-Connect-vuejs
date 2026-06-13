<script setup>
import { ref, computed } from 'vue';
import { useAppointmentsStore } from '../../stores/appointments';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import BaseTable from '../../components/dashboard/global/BaseTable.vue';
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue';
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue';
import BaseEmptyState from '../../components/dashboard/global/BaseEmptyState.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppointmentsStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'patient', label: 'Patient' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'facility', label: 'Facility' },
  { key: 'date', label: 'Date & Time', width: '180px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '100px' }
];

const searchQuery = ref('');
const statusFilter = ref('all');

const filteredAppointments = computed(() => {
  return store.appointments.filter(a => {
    const matchesSearch = a.patient.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         a.doctor.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || a.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
});

const getStatusVariant = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Cancelled': return 'danger';
    case 'Rescheduled': return 'warning';
    case 'Booked': return 'primary';
    default: return 'neutral';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.appointments') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ t('pageTitles.appointmentsDesc') }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatisticsCard title="Total" :value="store.stats.total" icon="calendar_today" color="primary" />
      <StatisticsCard title="Booked" :value="store.stats.booked" icon="bookmark" color="info" />
      <StatisticsCard title="Completed" :value="store.stats.completed" icon="check_circle" color="success" />
      <StatisticsCard title="Rescheduled" :value="store.stats.rescheduled" icon="history" color="warning" />
      <StatisticsCard title="Cancelled" :value="store.stats.cancelled" icon="cancel" color="danger" />
    </div>

    <!-- Controls -->
    <div class="flex flex-col lg:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search patient or doctor..." />
      <select 
        v-model="statusFilter"
        class="min-w-[160px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition cursor-pointer shadow-sm"
      >
        <option value="all">All Status</option>
        <option value="Booked">Booked</option>
        <option value="Completed">Completed</option>
        <option value="Rescheduled">Rescheduled</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :items="filteredAppointments">
      <template #cell(patient)="{ item }">
        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ item.patient }}</span>
      </template>
      
      <template #cell(doctor)="{ item }">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ item.doctor }}</span>
      </template>

      <template #cell(date)="{ item }">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{{ formatDate(item.date) }}</span>
      </template>

      <template #cell(status)="{ item }">
        <BaseBadge :variant="getStatusVariant(item.status)">
          {{ item.status }}
        </BaseBadge>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end">
          <button class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition" title="View Details">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState 
          v-if="searchQuery || statusFilter !== 'all'"
          title="No appointments found" 
          description="Try adjusting your search or filters"
          @reset="searchQuery = ''; statusFilter = 'all'"
        />
        <BaseEmptyState 
          v-else
          icon="calendar_month"
          title="No schedules yet" 
          description="Clinical appointments will appear here"
        />
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
