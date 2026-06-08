<script setup>
import BaseDialog from '../global/BaseDialog.vue';
import BaseBadge from '../global/BaseBadge.vue';
import { useInvoicesStore } from '../../../stores/invoices';

const props = defineProps({
  show: { type: Boolean, required: true },
  invoice: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useInvoicesStore();

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const togglePaid = () => {
  if (props.invoice.status === 'paid') {
    store.markAsUnpaid(props.invoice.id);
  } else {
    store.markAsPaid(props.invoice.id);
  }
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    title="Invoice Details" 
    size="md"
    @close="$emit('close')"
  >
    <div v-if="invoice" class="space-y-6">
      <div class="flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <h4 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ invoice.id }}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Patient: {{ invoice.patient_name }}</p>
        </div>
        <div class="text-right">
          <BaseBadge :variant="invoice.status === 'paid' ? 'success' : 'danger'">
            {{ invoice.status.toUpperCase() }}
          </BaseBadge>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">{{ formatDate(invoice.created_at) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Appointment ID</p>
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ invoice.appointment_id }}</p>
        </div>
        <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-right">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
          <p class="text-lg font-bold text-brand-primary">{{ formatCurrency(invoice.amount) }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Line Items</label>
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-left">
              <tr>
                <th class="px-4 py-2 font-bold text-slate-600 dark:text-slate-400">Description</th>
                <th class="px-4 py-2 font-bold text-slate-600 dark:text-slate-400 text-right">Price</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, idx) in invoice.items" :key="idx">
                <td class="px-4 py-2.5 text-slate-700 dark:text-slate-300">{{ item.description }}</td>
                <td class="px-4 py-2.5 text-slate-900 dark:text-slate-100 font-medium text-right">{{ formatCurrency(item.price) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 font-bold">
              <tr>
                <td class="px-4 py-2 text-slate-900 dark:text-slate-100">Total</td>
                <td class="px-4 py-2 text-brand-primary text-right">{{ formatCurrency(invoice.amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button 
          @click="togglePaid"
          class="inline-flex items-center justify-center gap-2 py-2 px-6 rounded-lg text-sm font-bold transition shadow-md"
          :class="invoice.status === 'paid' 
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700'"
        >
          <span class="material-symbols-outlined text-lg">{{ invoice.status === 'paid' ? 'close' : 'check' }}</span>
          Mark as {{ invoice.status === 'paid' ? 'Unpaid' : 'Paid' }}
        </button>
        <button 
          class="inline-flex items-center justify-center gap-2 py-2 px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-sm font-bold rounded-lg transition"
          @click="window.print()"
        >
          <span class="material-symbols-outlined text-lg">print</span>
          Print
        </button>
      </div>
    </div>
  </BaseDialog>
</template>
