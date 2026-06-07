<script setup>
import { ref, watch, computed } from 'vue';
import { useDashboardStore } from '../stores/dashboard';

const props = defineProps({
  show: { type: Boolean, required: true },
  facility: { type: Object, default: null },
  mode: { type: String, default: 'add' } // 'add', 'edit', 'view'
});

const emit = defineEmits(['close']);

const store = useDashboardStore();

// Local active mode to allow transitioning from view to edit
const activeMode = ref('add');

const name = ref('');
const type = ref('Medical Point');
const organization = ref('');
const parent = ref('');
const location = ref('');

// Populate form when modal state changes
watch(
  () => [props.show, props.facility, props.mode],
  () => {
    activeMode.value = props.mode;
    
    if (props.facility && (props.mode === 'edit' || props.mode === 'view')) {
      name.value = props.facility.name;
      type.value = props.facility.type;
      organization.value = props.facility.organization;
      parent.value = props.facility.parent || '';
      location.value = props.facility.location || '';
    } else {
      name.value = '';
      type.value = 'Medical Point';
      // Default to first organization in the list if available
      organization.value = store.organizations.length > 0 ? store.organizations[0].name : '';
      parent.value = '';
      location.value = '';
    }
  },
  { immediate: true }
);

// Filter list of available parent facilities to avoid referencing itself
const availableParentFacilities = computed(() => {
  if (activeMode.value === 'edit' && props.facility) {
    return store.facilities.filter(f => f.id !== props.facility.id);
  }
  return store.facilities;
});

// Google maps coordinates url
const getMapLink = (coords) => {
  if (!coords) return '#';
  const cleanCoords = coords.trim().replace(/\s+/g, '');
  return `https://www.google.com/maps/search/?api=1&query=${cleanCoords}`;
};

// CSS colors for facility badges
const getTypeClass = (t) => {
  if (!t) return '';
  const typeMap = {
    'Medical Point': 'bg-amber-100 text-amber-800',
    'Pharmacy': 'bg-emerald-100 text-emerald-800',
    'Clinic': 'bg-blue-100 text-blue-800',
    'Hospital': 'bg-red-100 text-red-800'
  };
  return typeMap[t] || 'bg-amber-100 text-amber-800';
};

const submitForm = () => {
  const data = {
    name: name.value,
    type: type.value,
    organization: organization.value,
    parent: parent.value,
    location: location.value
  };

  if (activeMode.value === 'edit' && props.facility && props.facility.id) {
    store.updateFacility(props.facility.id, data);
  } else if (activeMode.value === 'add') {
    store.addFacility(data);
  }
  emit('close');
};

const transitionToEdit = () => {
  activeMode.value = 'edit';
};
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <!-- Card Content -->
    <div class="bg-white rounded-xl w-full max-w-[540px] shadow-2xl overflow-hidden border border-slate-200 animate-slide-up">
      
      <!-- Modal Header -->
      <div class="p-5 px-6 border-b border-slate-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900">
          <span v-if="activeMode === 'view'">Facility Details</span>
          <span v-else-if="activeMode === 'edit'">Edit Facility</span>
          <span v-else>Add Facility</span>
        </h3>
        <button 
          class="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- READ-ONLY VIEW MODE -->
      <div v-if="activeMode === 'view'" class="p-6">
        <div class="flex flex-col gap-5">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold text-slate-900 mb-1.5">{{ facility?.name }}</h2>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="getTypeClass(facility?.type)">
                {{ facility?.type }}
              </span>
            </div>
          </div>
          
          <hr class="border-slate-100" />
          
          <div class="grid grid-cols-2 gap-y-5 gap-x-4">
            <div>
              <h4 class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Organization</h4>
              <p class="text-sm font-semibold text-slate-900">{{ facility?.organization }}</p>
            </div>
            
            <div>
              <h4 class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Parent Facility</h4>
              <p class="text-sm text-slate-700">{{ facility?.parent || 'None' }}</p>
            </div>
            
            <div>
              <h4 class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Location Coordinates</h4>
              <a 
                v-if="facility?.location" 
                :href="getMapLink(facility?.location)" 
                target="_blank" 
                class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-brand-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {{ facility?.location }}
              </a>
              <p v-else class="text-sm text-slate-700">None</p>
            </div>
            
            <div>
              <h4 class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Files Attachment</h4>
              <p class="text-sm text-slate-700">{{ facility?.files || 'None' }}</p>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button" 
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            @click="$emit('close')"
          >
            Close
          </button>
          <button 
            type="button" 
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
            @click="transitionToEdit"
          >
            Edit Details
          </button>
        </div>
      </div>

      <!-- ADD / EDIT MODE -->
      <form v-else @submit.prevent="submitForm">
        <div class="p-6 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="facName">Facility Name *</label>
            <input 
              id="facName" 
              type="text" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 transition" 
              required 
              placeholder="e.g. Nasser Medical Point"
              v-model="name"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="facType">Type *</label>
            <select 
              id="facType" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary transition cursor-pointer" 
              required 
              v-model="type"
            >
              <option value="" disabled>Select Facility Type</option>
              <option value="Medical Point">Medical Point</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Clinic">Clinic</option>
              <option value="Hospital">Hospital</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="facOrg">Organization *</label>
            <select 
              id="facOrg" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary transition cursor-pointer" 
              required 
              v-model="organization"
            >
              <option value="" disabled>Select Organization</option>
              <option v-for="org in store.organizations" :key="org.id" :value="org.name">
                {{ org.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="facParent">Parent Facility</label>
            <select 
              id="facParent" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary transition cursor-pointer" 
              v-model="parent"
            >
              <option value="">None</option>
              <option v-for="fac in availableParentFacilities" :key="fac.id" :value="fac.name">
                {{ fac.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="facLoc">Location Coordinates (Latitude, Longitude)</label>
            <input 
              id="facLoc" 
              type="text" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 transition" 
              placeholder="e.g. 31.3478, 34.3012"
              v-model="location"
            />
          </div>
        </div>

        <div class="p-4 px-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button" 
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            {{ activeMode === 'edit' ? 'Save Changes' : 'Create Facility' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
