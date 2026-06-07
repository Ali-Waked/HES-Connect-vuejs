import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useReportsStore = defineStore('reports', () => {
  const reports = ref([
    { id: 'REP-001', type: 'Monthly Patient Statistics', generated_at: '2026-06-01T10:00:00Z', data: { total_patients: 1250, new_patients: 150, discharged: 100, occupancy_rate: '85%' } },
    { id: 'REP-002', type: 'Inventory Usage Report', generated_at: '2026-06-02T11:30:00Z', data: { medicines_dispensed: 5400, low_stock_items: 12, critical_items: 3 } },
    { id: 'REP-003', type: 'Financial Summary', generated_at: '2026-06-03T09:15:00Z', data: { total_revenue: 45000, insurance_claims: 32000, cash_payments: 13000 } },
    { id: 'REP-004', type: 'Staff Performance Analytics', generated_at: '2026-06-05T14:45:00Z', data: { avg_consultation_time: '18 min', patient_satisfaction: '4.8/5' } }
  ]);

  const stats = computed(() => {
    const byType = reports.value.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: reports.value.length,
      types: Object.keys(byType).length
    };
  });

  const deleteReport = (id) => {
    reports.value = reports.value.filter(r => r.id !== id);
  };

  return {
    reports,
    stats,
    deleteReport
  };
});
