import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useClinicalStore = defineStore('clinical', () => {
  // Medication Requests
  const medicationRequests = ref([
    { id: 1, patient: 'Khalid Abu Amr', facility: 'Al-Awda Clinic Jabalia', prescription: 'RX-7721', status: 'Pending', date: '2026-06-07T09:00:00Z' },
    { id: 2, patient: 'Layla Ibrahim', facility: 'Kamal Adwan Hospital', prescription: 'RX-9902', status: 'Approved', date: '2026-06-06T14:30:00Z' },
    { id: 3, patient: 'Amir Zaki', facility: 'Al-Shifa Medical Complex', prescription: 'RX-4412', status: 'Rejected', date: '2026-06-05T11:20:00Z' }
  ]);

  // Prescriptions
  const prescriptions = ref([
    { id: 'RX-7721', appointment_id: 1, doctor: 'Dr. Ahmed Hassan', patient: 'Khalid Abu Amr', medicines: [{ name: 'Amoxicillin', dose: '500mg', duration: '7 days' }], created_at: '2026-06-07T10:15:00Z' },
    { id: 'RX-9902', appointment_id: 2, doctor: 'Dr. Fatima Al-Zahroa', patient: 'Layla Ibrahim', medicines: [{ name: 'Paracetamol', dose: '1g', duration: '3 days' }], created_at: '2026-06-06T12:00:00Z' }
  ]);

  const clinicalStats = computed(() => ({
    pendingRequests: medicationRequests.value.filter(r => r.status === 'Pending').length,
    totalPrescriptions: prescriptions.value.length,
    approvedRequests: medicationRequests.value.filter(r => r.status === 'Approved').length
  }));

  const approveRequest = (id) => {
    const req = medicationRequests.value.find(r => r.id === id);
    if (req) req.status = 'Approved';
  };

  const rejectRequest = (id) => {
    const req = medicationRequests.value.find(r => r.id === id);
    if (req) req.status = 'Rejected';
  };

  return {
    medicationRequests,
    prescriptions,
    clinicalStats,
    approveRequest,
    rejectRequest
  };
});
