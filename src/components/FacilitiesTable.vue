<script setup>
import { ref, computed } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import FacilityModal from './FacilityModal.vue';
import ConfirmModal from './ConfirmModal.vue';

const store = useDashboardStore();

// Search and filtering state
const searchQuery = ref('');
const selectedType = ref('all');

// Modals toggles
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const modalMode = ref('add'); // 'add', 'edit', 'view'
const selectedFacility = ref(null);

// Computes filtered list
const filteredFacilities = computed(() => {
  return store.facilities.filter(fac => {
    const matchesType = selectedType.value === 'all' || fac.type === selectedType.value;
    const query = searchQuery.value.toLowerCase().trim();
    const matchesSearch = !query || 
      fac.name.toLowerCase().includes(query) || 
      fac.organization.toLowerCase().includes(query) ||
      (fac.parent && fac.parent.toLowerCase().includes(query)) ||
      (fac.location && fac.location.toLowerCase().includes(query));
      
    return matchesType && matchesSearch;
  });
});

const filteredCount = computed(() => filteredFacilities.value.length);

const resetFilters = () => {
  searchQuery.value = '';
  selectedType.value = 'all';
};

// Map badge colors
const getTypeClass = (type) => {
  const typeMap = {
    'Medical Point': 'bg-amber-100 text-amber-800',
    'Pharmacy': 'bg-emerald-100 text-emerald-800',
    'Clinic': 'bg-blue-100 text-blue-800',
    'Hospital': 'bg-red-100 text-red-800'
  };
  return typeMap[type] || 'bg-amber-100 text-amber-800';
};

// Google maps coordinates link
const getMapLink = (coords) => {
  if (!coords) return '#';
  const cleanCoords = coords.trim().replace(/\s+/g, '');
  return `https://www.google.com/maps/search/?api=1&query=${cleanCoords}`;
};

// CRUD handlers
const openAddModal = () => {
  selectedFacility.value = null;
  modalMode.value = 'add';
  showFormModal.value = true;
};

const openEditModal = (facility) => {
  selectedFacility.value = facility;
  modalMode.value = 'edit';
  showFormModal.value = true;
};

const openViewModal = (facility) => {
  selectedFacility.value = facility;
  modalMode.value = 'view';
  showFormModal.value = true;
};

const confirmDelete = (facility) => {
  selectedFacility.value = facility;
  showDeleteModal.value = true;
};

const handleDelete = () => {
  if (selectedFacility.value) {
    store.deleteFacility(selectedFacility.value.id);
    showDeleteModal.value = false;
    selectedFacility.value = null;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Facilities</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ filteredCount }} registered {{ filteredCount === 1 ? 'facility' : 'facilities' }}</p>
      </div>
      <button 
        class="inline-flex items-center justify-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:shadow-brand-primary/20 transition cursor-pointer"
        @click="openAddModal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Facility
      </button>
    </div>

    <!-- Controls Bar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-grow">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4.5 h-4.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          class="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition" 
          placeholder="Search facilities..." 
          v-model="searchQuery"
        />
      </div>
      <select 
        class="min-w-[150px] p-2.5 pr-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] transition" 
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        v-model="selectedType"
      >
        <option value="all">All Types</option>
        <option value="Medical Point">Medical Point</option>
        <option value="Pharmacy">Pharmacy</option>
        <option value="Clinic">Clinic</option>
        <option value="Hospital">Hospital</option>
      </select>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      <!-- Empty state -->
      <div v-if="filteredFacilities.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">No facilities found matching your criteria.</p>
        <button class="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer" @click="resetFilters">Reset Filters</button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[25%]">Name</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">Type</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[25%]">Organization</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%]">Parent</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">Location</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[5%]">Files</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[5%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr 
              v-for="facility in filteredFacilities" 
              :key="facility.id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td class="px-6 py-4.5">
                <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-normal">{{ facility.name }}</span>
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="getTypeClass(facility.type)">
                  {{ facility.type }}
                </span>
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ facility.organization }}
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ facility.parent || '—' }}
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-sm">
                <a 
                  v-if="facility.location" 
                  :href="getMapLink(facility.location)" 
                  target="_blank" 
                  class="inline-flex items-center gap-1 text-brand-primary font-medium hover:underline cursor-pointer"
                  title="Open in Google Maps"
                >
                  <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ facility.location }}</span>
                </a>
                <span v-else class="text-slate-400 dark:text-slate-500">—</span>
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ facility.files || '—' }}
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-right">
                <div class="flex justify-end gap-1.5">
                  <button 
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                    title="View Details" 
                    @click="openViewModal(facility)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                    title="Edit Facility" 
                    @click="openEditModal(facility)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    class="text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition cursor-pointer"
                    title="Delete Facility" 
                    @click="confirmDelete(facility)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Facility Modal Form -->
    <FacilityModal 
      :show="showFormModal" 
      :facility="selectedFacility"
      :mode="modalMode"
      @close="showFormModal = false"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      :show="showDeleteModal"
      title="Delete Facility"
      :message="`Are you sure you want to delete <strong>${selectedFacility?.name}</strong>? This action cannot be undone.`"
      confirm-text="Delete"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />
  </div>
</template>
