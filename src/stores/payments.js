import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref([
    { id: 'PAY-2001', invoice_id: 'INV-1001', amount: 150.00, method: 'Credit Card', created_at: '2026-06-01T10:30:00Z', transaction_ref: 'tx_987654321' },
    { id: 'PAY-2002', invoice_id: 'INV-1003', amount: 75.50, method: 'PayPal', created_at: '2026-06-03T10:00:00Z', transaction_ref: 'pp_123456789' },
    { id: 'PAY-2003', invoice_id: 'INV-1005', amount: 120.00, method: 'Cash', created_at: '2026-06-04T09:00:00Z', transaction_ref: 'CASH-001' },
    { id: 'PAY-2004', invoice_id: 'INV-1006', amount: 50.00, method: 'Bank Transfer', created_at: '2026-06-05T15:20:00Z', transaction_ref: 'BT-998877' }
  ]);

  const stats = computed(() => {
    const totalAmount = payments.value.reduce((acc, curr) => acc + curr.amount, 0);
    const byMethod = payments.value.reduce((acc, curr) => {
      acc[curr.method] = (acc[curr.method] || 0) + 1;
      return acc;
    }, {});

    return {
      total: payments.value.length,
      amount: totalAmount.toFixed(2),
      methods: Object.keys(byMethod).length
    };
  });

  const deletePayment = (id) => {
    payments.value = payments.value.filter(p => p.id !== id);
  };

  return {
    payments,
    stats,
    deletePayment
  };
});
