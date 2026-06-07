import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref([
    { id: 1, patient: 'Khalid Abu Amr', doctor: 'Dr. Ahmed Hassan', facility: 'Al-Awda Clinic Jabalia', date: '2026-06-08T10:00:00Z', status: 'Booked', type: 'Consultation' },
    { id: 2, patient: 'Mohammed Al-Masri', doctor: 'Dr. Fatima Al-Zahroa', facility: 'European Gaza Hospital', date: '2026-06-08T11:30:00Z', status: 'Completed', type: 'Follow-up' },
    { id: 3, patient: 'Layla Ibrahim', doctor: 'Dr. Omar Khalil', facility: 'Kamal Adwan Hospital', date: '2026-06-09T09:15:00Z', status: 'Rescheduled', type: 'Surgery' },
    { id: 4, patient: 'Rania Saleh', doctor: 'Dr. Ahmed Hassan', facility: 'Al-Awda Clinic Jabalia', date: '2026-06-07T14:00:00Z', status: 'Cancelled', type: 'Emergency' },
    { id: 5, patient: 'Amir Zaki', doctor: 'Dr. Youssef Nasser', facility: 'Al-Shifa Medical Complex', date: '2026-06-10T10:00:00Z', status: 'Booked', type: 'General' }
  ]);

  const stats = computed(() => ({
    total: appointments.value.length,
    booked: appointments.value.filter(a => a.status === 'Booked').length,
    completed: appointments.value.filter(a => a.status === 'Completed').length,
    cancelled: appointments.value.filter(a => a.status === 'Cancelled').length,
    rescheduled: appointments.value.filter(a => a.status === 'Rescheduled').length
  }));

  const updateStatus = (id, status) => {
    const appt = appointments.value.find(a => a.id === id);
    if (appt) appt.status = status;
  };

  return {
    appointments,
    stats,
    updateStatus
  };
});
