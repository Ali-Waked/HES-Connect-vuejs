import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([
    { id: 'INV-1001', appointment_id: 'APT-501', patient_name: 'Khalid Abu Amr', amount: 150.00, status: 'paid', created_at: '2026-06-01T10:00:00Z', items: [{ description: 'General Consultation', price: 50 }, { description: 'Blood Test', price: 100 }] },
    { id: 'INV-1002', appointment_id: 'APT-502', patient_name: 'Mohammed Al-Masri', amount: 200.00, status: 'unpaid', created_at: '2026-06-02T11:30:00Z', items: [{ description: 'Specialist Consultation', price: 120 }, { description: 'X-Ray', price: 80 }] },
    { id: 'INV-1003', appointment_id: 'APT-503', patient_name: 'Layla Ibrahim', amount: 75.50, status: 'paid', created_at: '2026-06-03T09:15:00Z', items: [{ description: 'Follow-up Visit', price: 40 }, { description: 'Medication', price: 35.50 }] },
    { id: 'INV-1004', appointment_id: 'APT-504', patient_name: 'Rania Saleh', amount: 350.00, status: 'unpaid', created_at: '2026-06-05T14:45:00Z', items: [{ description: 'Minor Surgery', price: 300 }, { description: 'Local Anesthesia', price: 50 }] }
  ]);

  const stats = computed(() => {
    const totalRevenue = invoices.value.filter(inv => inv.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    return {
      total: invoices.value.length,
      paid: invoices.value.filter(inv => inv.status === 'paid').length,
      unpaid: invoices.value.filter(inv => inv.status === 'unpaid').length,
      revenue: totalRevenue.toFixed(2)
    };
  });

  const markAsPaid = (id) => {
    const invoice = invoices.value.find(inv => inv.id === id);
    if (invoice) invoice.status = 'paid';
  };

  const markAsUnpaid = (id) => {
    const invoice = invoices.value.find(inv => inv.id === id);
    if (invoice) invoice.status = 'unpaid';
  };

  const deleteInvoice = (id) => {
    invoices.value = invoices.value.filter(inv => inv.id !== id);
  };

  return {
    invoices,
    stats,
    markAsPaid,
    markAsUnpaid,
    deleteInvoice
  };
});
