import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMedicinesStore = defineStore('medicines', () => {
  const medicines = ref([
    { id: 1, uuid: 'med-987-abc', name: 'Paracetamol', description: 'Pain reliever and a fever reducer.', image: '', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, uuid: 'med-654-def', name: 'Amoxicillin', description: 'Antibiotic used to treat many different types of infection caused by bacteria.', image: '', created_at: '2026-06-02T11:30:00Z', updated_at: '2026-06-02T11:30:00Z' },
    { id: 3, uuid: 'med-321-ghi', name: 'Ibuprofen', description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for treating pain, fever, and inflammation.', image: '', created_at: '2026-06-03T09:15:00Z', updated_at: '2026-06-03T09:15:00Z' },
    { id: 4, uuid: 'med-159-jkl', name: 'Metformin', description: 'Medication that helps the insulin your body produces work better.', image: '', created_at: '2026-06-05T14:45:00Z', updated_at: '2026-06-05T14:45:00Z' }
  ]);

  const stats = computed(() => {
    const thisMonth = new Date().getMonth();
    const addedThisMonth = medicines.value.filter(m => new Date(m.created_at).getMonth() === thisMonth).length;

    return {
      total: medicines.value.length,
      addedThisMonth
    };
  });

  const addMedicine = (medicine) => {
    const newId = medicines.value.length > 0 ? Math.max(...medicines.value.map(m => m.id)) + 1 : 1;
    const now = new Date().toISOString();
    medicines.value.push({
      ...medicine,
      id: newId,
      uuid: `med-${Math.random().toString(36).substr(2, 9)}`,
      created_at: now,
      updated_at: now
    });
  };

  const updateMedicine = (id, updatedData) => {
    const idx = medicines.value.findIndex(m => m.id === id);
    if (idx !== -1) {
      medicines.value[idx] = { 
        ...medicines.value[idx], 
        ...updatedData, 
        updated_at: new Date().toISOString() 
      };
    }
  };

  const deleteMedicine = (id) => {
    medicines.value = medicines.value.filter(m => m.id !== id);
  };

  return {
    medicines,
    stats,
    addMedicine,
    updateMedicine,
    deleteMedicine
  };
});
