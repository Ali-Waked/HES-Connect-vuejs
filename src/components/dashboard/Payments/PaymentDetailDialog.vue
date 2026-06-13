<script setup>
import BaseDialog from '../global/BaseDialog.vue';
import BaseBadge from '../global/BaseBadge.vue';

defineProps({
  show: { type: Boolean, required: true },
  payment: { type: Object, default: null }
});

defineEmits(['close']);

const formatDate = (dateString) => {
  if (!dateString) return '';
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
</script>

<template>
  <BaseDialog 
    :show="show" 
    title="Payment Details" 
    size="md"
    @close="$emit('close')"
  >
    <div v-if="payment" class="space-y-6">
      <div class="flex flex-col items-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h4 class="text-3xl font-bold text-slate-900">{{ formatCurrency(payment.amount) }}</h4>
        <p class="text-sm font-medium text-slate-500 mt-1">Payment Successful</p>
      </div>

      <div class="space-y-4">
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-sm text-slate-500">Payment ID</span>
          <span class="text-sm font-bold text-slate-900">{{ payment.id }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-sm text-slate-500">Invoice ID</span>
          <span class="text-sm font-bold text-brand-primary underline cursor-pointer">{{ payment.invoice_id }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-sm text-slate-500">Payment Method</span>
          <BaseBadge :variant="getMethodVariant(payment.method)">{{ payment.method }}</BaseBadge>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-sm text-slate-500">Transaction Ref</span>
          <span class="text-sm font-mono text-slate-700">{{ payment.transaction_ref }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-sm text-slate-500">Date & Time</span>
          <span class="text-sm text-slate-700">{{ formatDate(payment.created_at) }}</span>
        </div>
      </div>

      <div class="flex justify-center pt-2">
        <button 
          @click="$emit('close')"
          class="w-full py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold rounded-xl transition"
        >
          Close Receipt
        </button>
      </div>
    </div>
  </BaseDialog>
</template>
