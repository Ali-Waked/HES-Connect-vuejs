import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuditStore = defineStore('audit', () => {
  const logs = ref([
    { id: 101, action: 'UPDATE', table_name: 'facilities', record_id: 'FAC-002', user: 'Super Admin', date: '2026-06-07T10:20:00Z', details: { old: { status: 'Inactive' }, new: { status: 'Active' } } },
    { id: 102, action: 'CREATE', table_name: 'users', record_id: 'USR-998', user: 'Super Admin', date: '2026-06-07T09:45:00Z', details: { new: { role: 'Doctor', email: 'dr.new@health.ps' } } },
    { id: 103, action: 'DELETE', table_name: 'medicines', record_id: 'MED-12', user: 'Super Admin', date: '2026-06-07T08:15:00Z', details: { old: { name: 'Aspirin' } } },
    { id: 104, action: 'LOGIN', table_name: 'auth', record_id: 'ADMIN-1', user: 'Super Admin', date: '2026-06-07T08:00:00Z', details: { ip: '192.168.1.1' } }
  ]);

  const auditStats = computed(() => ({
    actionsToday: logs.value.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).length,
    mostModified: 'facilities'
  }));

  return {
    logs,
    auditStats
  };
});
