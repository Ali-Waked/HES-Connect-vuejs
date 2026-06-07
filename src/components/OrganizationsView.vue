<template>
  <div class="organizations-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-title-section">
        <h1 class="page-title">Organizations</h1>
        <p class="page-subtitle">{{ filteredCount }} registered {{ filteredCount === 1 ? 'organization' : 'organizations' }}</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Organization
      </button>
    </div>

    <!-- Controls Bar (Search and Filter) -->
    <div class="controls-bar">
      <div class="search-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search organizations..." 
          v-model="searchQuery"
        />
      </div>
      <select class="filter-select" v-model="selectedType">
        <option value="all">All Types</option>
        <option value="Private">Private</option>
        <option value="NGO">NGO</option>
        <option value="International">International</option>
        <option value="UN Agency">UN Agency</option>
        <option value="Government">Government</option>
      </select>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <div v-if="filteredOrgs.length === 0" class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="empty-state-text">No organizations found matching your criteria.</p>
        <button class="btn btn-secondary" @click="resetFilters">Reset Filters</button>
      </div>

      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 45%;">Name</th>
              <th style="width: 15%;">Type</th>
              <th style="width: 15%;">Created</th>
              <th style="width: 15%;">Updated</th>
              <th style="width: 10%; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="org in filteredOrgs" :key="org.id">
              <td>
                <div class="org-info">
                  <span class="org-name">{{ org.name }}</span>
                  <span class="org-description">{{ org.description }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="getTypeClass(org.type)">{{ org.type }}</span>
              </td>
              <td>
                <span class="date-text">{{ org.created }}</span>
              </td>
              <td>
                <span class="date-text">{{ org.updated }}</span>
              </td>
              <td>
                <div class="actions-cell" style="justify-content: flex-end;">
                  <button class="action-btn" title="Edit Organization" @click="openEditModal(org)">
                    <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="action-btn delete" title="Delete Organization" @click="confirmDelete(org)">
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

    <!-- Add/Edit Modal -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'Edit Organization' : 'Add Organization' }}</h3>
          <button class="close-btn" @click="closeFormModal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveOrganization">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="orgName">Organization Name *</label>
              <input 
                id="orgName" 
                type="text" 
                class="form-input" 
                required 
                placeholder="e.g. Al-Awda Hospital Foundation"
                v-model="form.name"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="orgDesc">Description *</label>
              <textarea 
                id="orgDesc" 
                class="form-textarea" 
                required 
                placeholder="Provide a brief description of the organization..."
                v-model="form.description"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="orgType">Type *</label>
              <select id="orgType" class="form-select" required v-model="form.type">
                <option value="" disabled selected>Select Organization Type</option>
                <option value="Private">Private</option>
                <option value="NGO">NGO</option>
                <option value="International">International</option>
                <option value="UN Agency">UN Agency</option>
                <option value="Government">Government</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeFormModal">Cancel</button>
            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Save Changes' : 'Create Organization' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content" style="max-width: 440px;">
        <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
          <h3 class="modal-title" style="color: var(--color-danger);">Delete Organization</h3>
          <button class="close-btn" @click="closeDeleteModal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body" style="padding-top: 12px; padding-bottom: 8px;">
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
            Are you sure you want to delete <strong>{{ selectedOrg?.name }}</strong>? This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer" style="border-top: none; background: transparent; padding-top: 8px;">
          <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteOrganization">Delete</button>
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
const initialOrganizations = [
  {
    id: 1,
    name: 'Al-Awda Hospital Foundation',
    description: 'Private healthcare provider in northern Gaza',
    type: 'Private',
    created: 'May 7, 2026',
    updated: 'Jun 6, 2026'
  },
  {
    id: 2,
    name: 'Palestinian Red Crescent',
    description: 'Emergency medical services and ambulance',
    type: 'NGO',
    created: 'May 2, 2026',
    updated: 'Jun 5, 2026'
  },
  {
    id: 3,
    name: 'Islamic Relief Worldwide',
    description: 'Humanitarian aid and health services',
    type: 'NGO',
    created: 'Apr 27, 2026',
    updated: 'Jun 4, 2026'
  },
  {
    id: 4,
    name: 'World Health Organization',
    description: 'WHO field operations in Gaza Strip',
    type: 'International',
    created: 'Apr 22, 2026',
    updated: 'May 27, 2026'
  },
  {
    id: 5,
    name: 'Doctors Without Borders',
    description: 'International medical humanitarian organization',
    type: 'NGO',
    created: 'Apr 17, 2026',
    updated: 'May 30, 2026'
  },
  {
    id: 6,
    name: 'UNRWA Health Department',
    description: 'United Nations Relief and Works Agency health services',
    type: 'UN Agency',
    created: 'Apr 12, 2026',
    updated: 'Jun 3, 2026'
  },
  {
    id: 7,
    name: 'Ministry of Health Gaza',
    description: 'Main governmental health authority in the Gaza Strip',
    type: 'Government',
    created: 'Apr 7, 2026',
    updated: 'Jun 1, 2026'
  }
];

// Reactive states
const organizations = ref([]);
const searchQuery = ref('');
const selectedType = ref('all');

// Modals state
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);

// Form variables
const selectedOrg = ref(null);
const form = ref({
  id: null,
  name: '',
  description: '',
  type: ''
});

// Toast Notifications state
const toasts = ref([]);
let toastIdCounter = 0;

// Load from LocalStorage or seed with initial data
onMounted(() => {
  const stored = localStorage.getItem('hes_organizations');
  if (stored) {
    try {
      organizations.value = JSON.parse(stored);
    } catch (e) {
      organizations.value = initialOrganizations;
    }
  } else {
    organizations.value = initialOrganizations;
    saveToLocalStorage();
  }
});

// Helper: Save to LocalStorage
const saveToLocalStorage = () => {
  localStorage.setItem('hes_organizations', JSON.stringify(organizations.value));
};

// Filter & Search Logic
const filteredOrgs = computed(() => {
  return organizations.value.filter(org => {
    // Type Filter
    const matchesType = selectedType.value === 'all' || org.type === selectedType.value;
    
    // Search Query
    const query = searchQuery.value.toLowerCase().trim();
    const matchesSearch = !query || 
      org.name.toLowerCase().includes(query) || 
      org.description.toLowerCase().includes(query);
      
    return matchesType && matchesSearch;
  });
});

const filteredCount = computed(() => filteredOrgs.value.length);

const resetFilters = () => {
  searchQuery.value = '';
  selectedType.value = 'all';
};

// CSS Class mapping for organization types
const getTypeClass = (type) => {
  if (!type) return '';
  const typeMap = {
    'Private': 'private',
    'NGO': 'ngo',
    'International': 'international',
    'UN Agency': 'un-agency',
    'Government': 'government'
  };
  return typeMap[type] || 'private';
};

// Modal functions
const openAddModal = () => {
  isEditing.value = false;
  selectedOrg.value = null;
  form.value = {
    id: null,
    name: '',
    description: '',
    type: ''
  };
  showFormModal.value = true;
};

const openEditModal = (org) => {
  isEditing.value = true;
  selectedOrg.value = org;
  form.value = {
    id: org.id,
    name: org.name,
    description: org.description,
    type: org.type
  };
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

const confirmDelete = (org) => {
  selectedOrg.value = org;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedOrg.value = null;
};

// Formats date as 'MMM D, YYYY' (e.g. Jun 6, 2026)
const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// Save logic (Add & Edit)
const saveOrganization = () => {
  const currentDate = formatDate(new Date());

  if (isEditing.value && form.value.id) {
    // Edit Mode
    const index = organizations.value.findIndex(o => o.id === form.value.id);
    if (index !== -1) {
      organizations.value[index] = {
        ...organizations.value[index],
        name: form.value.name,
        description: form.value.description,
        type: form.value.type,
        updated: currentDate
      };
      saveToLocalStorage();
      addToast('Organization updated successfully', 'success');
    }
  } else {
    // Add Mode
    const nextId = organizations.value.length > 0 
      ? Math.max(...organizations.value.map(o => o.id)) + 1 
      : 1;
      
    const newOrg = {
      id: nextId,
      name: form.value.name,
      description: form.value.description,
      type: form.value.type,
      created: currentDate,
      updated: currentDate
    };
    
    organizations.value.unshift(newOrg); // Add to the top
    saveToLocalStorage();
    addToast('Organization added successfully', 'success');
  }
  
  closeFormModal();
};

// Delete logic
const deleteOrganization = () => {
  if (selectedOrg.value) {
    organizations.value = organizations.value.filter(o => o.id !== selectedOrg.value.id);
    saveToLocalStorage();
    addToast(`Deleted "${selectedOrg.value.name}"`, 'error');
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
.organizations-view {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
