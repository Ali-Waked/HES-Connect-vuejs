<script setup>
import { ref, computed } from 'vue';
import { usePaymentsStore } from '../../../stores/payments';
import BaseTable from '../global/BaseTable.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseBadge from '../global/BaseBadge.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import PaymentDetailDialog from './PaymentDetailDialog.vue';

const store = usePaymentsStore();

const columns = [
  { key: 'id', label: 'ID', width: '120px' },
  { key: 'invoice_id', label: 'Invoice ID', width: '120px' },
  { key: 'amount', label: 'Amount', width: '120px' },
  { key: 'method', label: 'Method', width: '150px' },
  { key: 'created_at', label: 'Date', width: '180px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' }
];

const searchQuery = ref('');
const methodFilter = ref('all');

const filteredPayments = computed(() => {
  return store.payments.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         p.invoice_id.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesMethod = methodFilter.value === 'all' || p.method === methodFilter.value;
    return matchesSearch && matchesMethod;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getMethodVariant = (method) => {
  switch (method) {
    case 'Credit Card': return 'primary';
    case 'PayPal': return 'info';
    case 'Cash': return 'success';
    case 'Bank Transfer': return 'warning';
    default: return 'neutral';
  }
};

// Actions
const selectedPayment = ref(null);
const showDetailDialog = ref(false);
const showDeleteConfirm = ref(false);

const viewPayment = (payment) => {
  selectedPayment.value = payment;
  showDetailDialog.value = true;
};

const confirmDelete = (payment) => {
  selectedPayment.value = payment;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedPayment.value) {
    store.deletePayment(selectedPayment.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search by payment or invoice ID..." />
      <select 
        v-model="methodFilter"
        class="min-w-[160px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition"
      >
        <option value="all">All Methods</option>
        <option value="Credit Card">Credit Card</option>
        <option value="PayPal">PayPal</option>
        <option value="Cash">Cash</option>
        <option value="Bank Transfer">Bank Transfer</option>
      </select>
    </div>

    <BaseTable :columns="columns" :items="filteredPayments">
      <template #cell(amount)="{ item }">
        <span class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ formatCurrency(item.amount) }}</span>
      </template>

      <template #cell(method)="{ item }">
        <BaseBadge :variant="getMethodVariant(item.method)">
          {{ item.method }}
        </BaseBadge>
      </template>

      <template #cell(created_at)="{ item }">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="viewPayment(item)"
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
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete Payment"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState 
          v-if="searchQuery || methodFilter !== 'all'"
          title="No payments found" 
          description="Try adjusting your filters"
          @reset="searchQuery = ''; methodFilter = 'all'"
        />
        <BaseEmptyState 
          v-else
          icon="payments"
          title="No payments yet" 
          description="Transaction records will appear here"
        />
      </template>
    </BaseTable>

    <PaymentDetailDialog 
      :show="showDetailDialog"
      :payment="selectedPayment"
      @close="showDetailDialog = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Payment Record"
      :message="`Are you sure you want to delete payment record <strong>${selectedPayment?.id}</strong>?`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
