<script setup>
import { ref, watch } from 'vue';
import { useDashboardStore } from '../../../stores/dashboard';

const props = defineProps({
  show: { type: Boolean, required: true },
  org: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const store = useDashboardStore();

const name = ref('');
const description = ref('');
const type = ref('');

watch(
  () => props.org,
  (newOrg) => {
    if (newOrg) {
      name.value = newOrg.name;
      description.value = newOrg.description;
      type.value = newOrg.type;
    } else {
      name.value = '';
      description.value = '';
      type.value = '';
    }
  },
  { immediate: true }
);

const submitForm = () => {
  const data = {
    name: name.value,
    description: description.value,
    type: type.value
  };

  if (props.org && props.org.id) {
    store.updateOrg(props.org.id, data);
  } else {
    store.addOrg(data);
  }
  emit('close');
};
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl w-full max-w-[520px] shadow-2xl overflow-hidden border border-slate-200 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900">
          {{ org ? 'Edit Organization' : 'Add Organization' }}
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
      
      <form @submit.prevent="submitForm">
        <div class="p-6 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="orgName">Organization Name *</label>
            <input 
              id="orgName" 
              type="text" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 transition" 
              required 
              placeholder="e.g. Al-Awda Hospital Foundation"
              v-model="name"
            />
          </div>
          
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="orgDesc">Description *</label>
            <textarea 
              id="orgDesc" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 min-h-[90px] resize-y transition" 
              required 
              placeholder="Provide a brief description of the organization..."
              v-model="description"
            ></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="orgType">Type *</label>
            <select 
              id="orgType" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-brand-primary transition cursor-pointer" 
              required 
              v-model="type"
            >
              <option value="" disabled>Select Organization Type</option>
              <option value="Private">Private</option>
              <option value="NGO">NGO</option>
              <option value="International">International</option>
              <option value="UN Agency">UN Agency</option>
              <option value="Government">Government</option>
            </select>
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
            {{ org ? 'Save Changes' : 'Create Organization' }}
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
