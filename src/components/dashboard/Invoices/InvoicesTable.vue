<script setup>
import { ref, computed } from 'vue';
import { useInvoicesStore } from '../../../stores/invoices';
import BaseTable from '../global/BaseTable.vue';
import BaseBadge from '../global/BaseBadge.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import InvoiceDetailDialog from './InvoiceDetailDialog.vue';

const store = useInvoicesStore();

const columns = [
  { key: 'id', label: 'ID', width: '120px' },
  { key: 'appointment_id', label: 'Appt ID', width: '120px' },
  { key: 'patient_name', label: 'Patient' },
  { key: 'amount', label: 'Amount', width: '120px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'created_at', label: 'Date', width: '150px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '150px' }
];

const searchQuery = ref('');
const statusFilter = ref('all');

const filteredInvoices = computed(() => {
  return store.invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         inv.patient_name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || inv.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const getStatusVariant = (status) => {
  return status === 'paid' ? 'success' : 'danger';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Actions
const selectedInvoice = ref(null);
const showDetailDialog = ref(false);
const showDeleteConfirm = ref(false);

const viewInvoice = (invoice) => {
  selectedInvoice.value = invoice;
  showDetailDialog.value = true;
};

const confirmDelete = (invoice) => {
  selectedInvoice.value = invoice;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedInvoice.value) {
    store.deleteInvoice(selectedInvoice.value.id);
    showDeleteConfirm.value = false;
  }
};

const printInvoice = (invoice) => {
  alert(`Printing invoice ${invoice.id}... (Simulation)`);
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search by ID or patient..." />
      <select 
        v-model="statusFilter"
        class="min-w-[140px] p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none cursor-pointer transition"
      >
        <option value="all">All Status</option>
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>
    </div>

    <BaseTable :columns="columns" :items="filteredInvoices">
      <template #cell(amount)="{ item }">
        <span class="text-sm font-bold text-slate-900">{{ formatCurrency(item.amount) }}</span>
      </template>
      
      <template #cell(status)="{ item }">
        <BaseBadge :variant="getStatusVariant(item.status)">
          {{ item.status }}
        </BaseBadge>
      </template>

      <template #cell(created_at)="{ item }">
        <span class="text-xs text-slate-500">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="viewInvoice(item)"
            class="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
            title="View Details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            @click="printInvoice(item)"
            class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Print Invoice"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete Invoice"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState 
          v-if="searchQuery || statusFilter !== 'all'"
          title="No invoices found" 
          description="Try adjusting your filters"
          @reset="searchQuery = ''; statusFilter = 'all'"
        />
        <BaseEmptyState 
          v-else
          icon="receipt_long"
          title="No invoices yet" 
          description="Clinic invoices will appear here"
        />
      </template>
    </BaseTable>

    <InvoiceDetailDialog 
      :show="showDetailDialog"
      :invoice="selectedInvoice"
      @close="showDetailDialog = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Invoice"
      :message="`Are you sure you want to delete invoice <strong>${selectedInvoice?.id}</strong>?`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
