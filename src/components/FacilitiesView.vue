<template>
  <div class="facilities-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-title-section">
        <h1 class="page-title">Facilities</h1>
        <p class="page-subtitle">{{ filteredCount }} registered {{ filteredCount === 1 ? 'facility' : 'facilities' }}</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Facility
      </button>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <div class="search-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search facilities..." 
          v-model="searchQuery"
        />
      </div>
      <select class="filter-select" v-model="selectedType">
        <option value="all">All Types</option>
        <option value="Medical Point">Medical Point</option>
        <option value="Pharmacy">Pharmacy</option>
        <option value="Clinic">Clinic</option>
        <option value="Hospital">Hospital</option>
      </select>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <div v-if="filteredFacilities.length === 0" class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="empty-state-text">No facilities found matching your criteria.</p>
        <button class="btn btn-secondary" @click="resetFilters">Reset Filters</button>
      </div>

      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25%;">Name</th>
              <th style="width: 15%;">Type</th>
              <th style="width: 25%;">Organization</th>
              <th style="width: 10%;">Parent</th>
              <th style="width: 15%;">Location</th>
              <th style="width: 5%;">Files</th>
              <th style="width: 5%; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="facility in filteredFacilities" :key="facility.id">
              <td>
                <div class="org-info">
                  <span class="org-name">{{ facility.name }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="getTypeClass(facility.type)">{{ facility.type }}</span>
              </td>
              <td>
                <span class="date-text" style="font-weight: 500;">{{ facility.organization }}</span>
              </td>
              <td>
                <span class="date-text">{{ facility.parent || '—' }}</span>
              </td>
              <td>
                <a 
                  v-if="facility.location" 
                  :href="getMapLink(facility.location)" 
                  target="_blank" 
                  class="location-link"
                  title="Open in Google Maps"
                >
                  <svg class="location-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ facility.location }}</span>
                </a>
                <span v-else class="date-text">—</span>
              </td>
              <td>
                <span class="date-text">{{ facility.files || '—' }}</span>
              </td>
              <td>
                <div class="actions-cell" style="justify-content: flex-end;">
                  <button class="action-btn" title="View Facility Details" @click="viewDetails(facility)">
                    <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button class="action-btn" title="Edit Facility" @click="openEditModal(facility)">
                    <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="action-btn delete" title="Delete Facility" @click="confirmDelete(facility)">
                    <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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

    <!-- View Facility Details Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-content" style="max-width: 560px;">
        <div class="modal-header">
          <h3 class="modal-title">Facility Details</h3>
          <button class="close-btn" @click="closeViewModal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body" style="padding: 24px;">
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                  {{ selectedFacility?.name }}
                </h2>
                <span class="badge" :class="getTypeClass(selectedFacility?.type)">{{ selectedFacility?.type }}</span>
              </div>
            </div>
            
            <hr style="border: 0; border-top: 1px solid var(--border-color);" />
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">Organization</h4>
                <p style="font-size: 14px; font-weight: 600; color: var(--text-primary);">{{ selectedFacility?.organization }}</p>
              </div>
              <div>
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">Parent Facility</h4>
                <p style="font-size: 14px; color: var(--text-secondary);">{{ selectedFacility?.parent || 'None' }}</p>
              </div>
              <div>
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">Location Coordinates</h4>
                <a 
                  v-if="selectedFacility?.location" 
                  :href="getMapLink(selectedFacility?.location)" 
                  target="_blank" 
                  class="location-link"
                >
                  <svg class="location-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {{ selectedFacility?.location }}
                </a>
                <p v-else style="font-size: 14px; color: var(--text-secondary);">None</p>
              </div>
              <div>
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">Files Attachment</h4>
                <p style="font-size: 14px; color: var(--text-secondary);">{{ selectedFacility?.files || 'None' }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeViewModal">Close</button>
          <button class="btn btn-primary" @click="transitionToEdit(selectedFacility)">Edit Details</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Facility Modal -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'Edit Facility' : 'Add Facility' }}</h3>
          <button class="close-btn" @click="closeFormModal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveFacility">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="facName">Facility Name *</label>
              <input 
                id="facName" 
                type="text" 
                class="form-input" 
                required 
                placeholder="e.g. Nasser Medical Point"
                v-model="form.name"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="facType">Type *</label>
              <select id="facType" class="form-select" required v-model="form.type">
                <option value="" disabled>Select Facility Type</option>
                <option value="Medical Point">Medical Point</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Clinic">Clinic</option>
                <option value="Hospital">Hospital</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="facOrg">Organization *</label>
              <select id="facOrg" class="form-select" required v-model="form.organization">
                <option value="" disabled>Select Organization</option>
                <option v-for="org in organizations" :key="org.id" :value="org.name">
                  {{ org.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="facParent">Parent Facility</label>
              <select id="facParent" class="form-select" v-model="form.parent">
                <option value="">None</option>
                <option v-for="fac in availableParentFacilities" :key="fac.id" :value="fac.name">
                  {{ fac.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="facLoc">Location Coordinates (Latitude, Longitude)</label>
              <input 
                id="facLoc" 
                type="text" 
                class="form-input" 
                placeholder="e.g. 31.3478, 34.3012"
                v-model="form.location"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeFormModal">Cancel</button>
            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Save Changes' : 'Create Facility' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content" style="max-width: 440px;">
        <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
          <h3 class="modal-title" style="color: var(--color-danger);">Delete Facility</h3>
          <button class="close-btn" @click="closeDeleteModal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body" style="padding-top: 12px; padding-bottom: 8px;">
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
            Are you sure you want to delete <strong>{{ selectedFacility?.name }}</strong>? This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer" style="border-top: none; background: transparent; padding-top: 8px;">
          <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteFacility">Delete</button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" class="toast">
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px; color: #10b981;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px; color: #ef4444;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Initial Mock Dataset matching the requirements and image mock exactly
const initialFacilities = [
  {
    id: 1,
    name: 'Nasser Medical Point',
    type: 'Medical Point',
    organization: 'Ministry of Health Gaza',
    parent: '',
    location: '31.3478, 34.3012',
    files: ''
  },
  {
    id: 2,
    name: 'Al-Shifa Emergency Unit',
    type: 'Medical Point',
    organization: 'Ministry of Health Gaza',
    parent: '',
    location: '31.5195, 34.4370',
    files: ''
  },
  {
    id: 3,
    name: 'MSF Emergency Pharmacy',
    type: 'Pharmacy',
    organization: 'Doctors Without Borders',
    parent: '',
    location: '31.4990, 34.4601',
    files: ''
  },
  {
    id: 4,
    name: 'Al-Awda Clinic Jabalia',
    type: 'Clinic',
    organization: 'Al-Awda Hospital Foundation',
    parent: '',
    location: '31.5310, 34.4826',
    files: ''
  },
  {
    id: 5,
    name: 'UNRWA Health Center Rafah',
    type: 'Clinic',
    organization: 'UNRWA Health Department',
    parent: '',
    location: '31.2963, 34.2545',
    files: ''
  },
  {
    id: 6,
    name: 'European Gaza Hospital',
    type: 'Hospital',
    organization: 'Ministry of Health Gaza',
    parent: '',
    location: '31.3430, 34.2987',
    files: ''
  },
  {
    id: 7,
    name: 'Kamal Adwan Hospital',
    type: 'Hospital',
    organization: 'Ministry of Health Gaza',
    parent: '',
    location: '31.5560, 34.4965',
    files: ''
  },
  {
    id: 8,
    name: 'Al-Shifa Medical Complex',
    type: 'Hospital',
    organization: 'Ministry of Health Gaza',
    parent: '',
    location: '31.5200, 34.4375',
    files: ''
  }
];

// Seed fallback organizations list in case we need them
const defaultOrganizations = [
  { id: 1, name: 'Ministry of Health Gaza' },
  { id: 2, name: 'Doctors Without Borders' },
  { id: 3, name: 'Al-Awda Hospital Foundation' },
  { id: 4, name: 'UNRWA Health Department' },
  { id: 5, name: 'Islamic Relief Worldwide' },
  { id: 6, name: 'Palestinian Red Crescent' },
  { id: 7, name: 'World Health Organization' }
];

// Reactive states
const facilities = ref([]);
const organizations = ref([]);
const searchQuery = ref('');
const selectedType = ref('all');

// Modals state
const showFormModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);

// Form variables
const selectedFacility = ref(null);
const form = ref({
  id: null,
  name: '',
  type: 'Medical Point',
  organization: '',
  parent: '',
  location: ''
});

// Toast Notifications state
const toasts = ref([]);
let toastIdCounter = 0;

// Load lists from LocalStorage or seed defaults
onMounted(() => {
  // Load Organizations for dropdown relationship
  const storedOrgs = localStorage.getItem('hes_organizations');
  if (storedOrgs) {
    try {
      organizations.value = JSON.parse(storedOrgs);
    } catch (e) {
      organizations.value = defaultOrganizations;
    }
  } else {
    organizations.value = defaultOrganizations;
  }

  // Load Facilities
  const storedFacs = localStorage.getItem('hes_facilities');
  if (storedFacs) {
    try {
      facilities.value = JSON.parse(storedFacs);
    } catch (e) {
      facilities.value = initialFacilities;
    }
  } else {
    facilities.value = initialFacilities;
    saveToLocalStorage();
  }
});

// Helper: Save to LocalStorage
const saveToLocalStorage = () => {
  localStorage.setItem('hes_facilities', JSON.stringify(facilities.value));
};

// Filter & Search Logic
const filteredFacilities = computed(() => {
  return facilities.value.filter(fac => {
    // Type Filter
    const matchesType = selectedType.value === 'all' || fac.type === selectedType.value;
    
    // Search Query
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

// CSS Class mapping for facility types
const getTypeClass = (type) => {
  if (!type) return '';
  const typeMap = {
    'Medical Point': 'medical-point',
    'Pharmacy': 'pharmacy',
    'Clinic': 'clinic',
    'Hospital': 'hospital'
  };
  return typeMap[type] || 'medical-point';
};

// Parent selection options (exclude current facility if editing to prevent circular references)
const availableParentFacilities = computed(() => {
  if (isEditing.value && form.value.id) {
    return facilities.value.filter(f => f.id !== form.value.id);
  }
  return facilities.value;
});

// Map coordinates link
const getMapLink = (coords) => {
  if (!coords) return '';
  const cleanCoords = coords.trim().replace(/\s+/g, '');
  return `https://www.google.com/maps/search/?api=1&query=${cleanCoords}`;
};

// Modal handlers
const openAddModal = () => {
  isEditing.value = false;
  selectedFacility.value = null;
  
  // Set default organization if available
  const defaultOrg = organizations.value.length > 0 ? organizations.value[0].name : '';
  
  form.value = {
    id: null,
    name: '',
    type: 'Medical Point',
    organization: defaultOrg,
    parent: '',
    location: ''
  };
  showFormModal.value = true;
};

const openEditModal = (facility) => {
  isEditing.value = true;
  selectedFacility.value = facility;
  form.value = {
    id: facility.id,
    name: facility.name,
    type: facility.type,
    organization: facility.organization,
    parent: facility.parent || '',
    location: facility.location || ''
  };
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

const viewDetails = (facility) => {
  selectedFacility.value = facility;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedFacility.value = null;
};

const transitionToEdit = (facility) => {
  closeViewModal();
  openEditModal(facility);
};

const confirmDelete = (facility) => {
  selectedFacility.value = facility;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedFacility.value = null;
};

// Save logic (Add & Edit)
const saveFacility = () => {
  if (isEditing.value && form.value.id) {
    // Edit Mode
    const index = facilities.value.findIndex(f => f.id === form.value.id);
    if (index !== -1) {
      facilities.value[index] = {
        ...facilities.value[index],
        name: form.value.name,
        type: form.value.type,
        organization: form.value.organization,
        parent: form.value.parent,
        location: form.value.location
      };
      saveToLocalStorage();
      addToast('Facility updated successfully', 'success');
    }
  } else {
    // Add Mode
    const nextId = facilities.value.length > 0 
      ? Math.max(...facilities.value.map(f => f.id)) + 1 
      : 1;
      
    const newFacility = {
      id: nextId,
      name: form.value.name,
      type: form.value.type,
      organization: form.value.organization,
      parent: form.value.parent,
      location: form.value.location,
      files: ''
    };
    
    facilities.value.unshift(newFacility); // Add to the top
    saveToLocalStorage();
    addToast('Facility added successfully', 'success');
  }
  
  closeFormModal();
};

// Delete logic
const deleteFacility = () => {
  if (selectedFacility.value) {
    facilities.value = facilities.value.filter(f => f.id !== selectedFacility.value.id);
    saveToLocalStorage();
    addToast(`Deleted "${selectedFacility.value.name}"`, 'error');
    closeDeleteModal();
  }
};

// Toast Notifications System
const addToast = (message, type = 'success') => {
  const id = ++toastIdCounter;
  toasts.value.push({ id, message, type });
  
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3000);
};
</script>

<style scoped>
.facilities-view {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
