<script setup>
import { ref, computed } from 'vue';
import { useDashboardStore } from '../../../stores/dashboard';
import DepartmentModal from './DepartmentModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';

const store = useDashboardStore();

const searchQuery   = ref('');
const showModal     = ref(false);
const showDelModal  = ref(false);
const modalMode     = ref('add');
const selectedDept  = ref(null);

// Facility name colour (matches the link colour in mockup)
const facilityColor = 'text-teal-600 hover:text-teal-700';

// Head avatar: always teal circle with first letter of first name after "Dr. "
const headInitial = (head) => head?.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase() || 'D';

// â”€â”€â”€ Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return store.departments;
  return store.departments.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.facility.toLowerCase().includes(q) ||
    d.head.toLowerCase().includes(q)
  );
});

// â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const openAdd  = () => { selectedDept.value = null; modalMode.value = 'add'; showModal.value = true; };
const openEdit = (d) => { selectedDept.value = d; modalMode.value = 'edit'; showModal.value = true; };
const confirmDel = (d) => { selectedDept.value = d; showDelModal.value = true; };
const handleDelete = () => {
  if (selectedDept.value) { store.deleteDept(selectedDept.value.id); showDelModal.value = false; selectedDept.value = null; }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Departments</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ store.deptCount }} {{ store.deptCount === 1 ? 'department' : 'departments' }} across all facilities</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAdd"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Add Department
      </button>
    </div>

    <!-- â”€â”€ Search bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="relative">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        type="text"
        v-model="searchQuery"
        class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
        placeholder="Search departments..."
      />
    </div>

    <!-- â”€â”€ Table card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">

      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">No departments match your search.</p>
        <button class="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer" @click="searchQuery = ''">Clear Search</button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Facility</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department Head</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="dept in filtered"
              :key="dept.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <!-- Name with grid icon -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <!-- Department grid icon -->
                  <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ dept.name }}</span>
                </div>
              </td>

              <!-- Facility (teal link style) -->
              <td class="px-6 py-4">
                <span class="text-sm font-medium" :class="facilityColor">{{ dept.facility }}</span>
              </td>

              <!-- Department Head avatar + name -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {{ headInitial(dept.head) }}
                  </div>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ dept.head }}</span>
                </div>
              </td>

              <!-- Created date -->
              <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ dept.created }}</td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex justify-end gap-1.5">
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                    title="Edit Department"
                    @click="openEdit(dept)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                    title="Delete Department"
                    @click="confirmDel(dept)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <DepartmentModal
      :show="showModal"
      :dept="selectedDept"
      :mode="modalMode"
      @close="showModal = false"
    />
    <ConfirmModal
      :show="showDelModal"
      title="Delete Department"
      :message="`Are you sure you want to delete <strong>${selectedDept?.name}</strong>?`"
      confirm-text="Delete"
      @confirm="handleDelete"
      @close="showDelModal = false"
    />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
