<script setup>
import { ref, watch } from 'vue';
import { useDashboardStore } from '../../../stores/dashboard';

const props = defineProps({
  show: { type: Boolean, required: true },
  dept: { type: Object, default: null },
  mode: { type: String, default: 'add' }   // 'add' | 'edit'
});
const emit = defineEmits(['close']);

const store = useDashboardStore();

// Facility options from the store
const facilityOptions = [
  'Al-Awda Clinic Jabalia',
  'European Gaza Hospital',
  'Kamal Adwan Hospital',
  'Al-Shifa Medical Complex',
  'Nasser Medical Point',
  'Al-Shifa Emergency Unit',
  'MSF Emergency Pharmacy',
  'UNRWA Health Center Rafah',
];

const name     = ref('');
const facility = ref('');
const head     = ref('');

watch(() => [props.show, props.dept, props.mode], () => {
  if (props.dept && props.mode === 'edit') {
    name.value     = props.dept.name;
    facility.value = props.dept.facility;
    head.value     = props.dept.head;
  } else {
    name.value = ''; facility.value = ''; head.value = '';
  }
}, { immediate: true });

const submit = () => {
  const data = { name: name.value, facility: facility.value, head: head.value };
  if (props.mode === 'edit' && props.dept?.id) {
    store.updateDept(props.dept.id, data);
  } else {
    store.addDept(data);
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
    <div class="bg-white rounded-xl w-full max-w-[480px] shadow-2xl border border-slate-200 animate-slide-up overflow-hidden">

      <!-- Header -->
      <div class="flex justify-between items-center p-5 px-6 border-b border-slate-100">
        <h3 class="text-lg font-bold text-slate-900">
          {{ mode === 'edit' ? 'Edit Department' : 'Add Department' }}
        </h3>
        <button class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg cursor-pointer transition" @click="$emit('close')">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit">
        <div class="p-6 flex flex-col gap-4">

          <!-- Department Name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="dName">Department Name *</label>
            <input
              id="dName"
              v-model="name"
              type="text"
              required
              placeholder="e.g. Internal Medicine"
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none transition"
            />
          </div>

          <!-- Facility -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="dFacility">Facility *</label>
            <select
              id="dFacility"
              v-model="facility"
              required
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none cursor-pointer transition bg-white"
            >
              <option value="" disabled>Select a facility</option>
              <option v-for="f in facilityOptions" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>

          <!-- Department Head -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="dHead">Department Head *</label>
            <input
              id="dHead"
              v-model="head"
              type="text"
              required
              placeholder="e.g. Dr. Youssef Nasser"
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none transition"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 px-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            class="py-2 px-4.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            @click="$emit('close')"
          >Cancel</button>
          <button
            type="submit"
            class="py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            {{ mode === 'edit' ? 'Save Changes' : 'Create Department' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
