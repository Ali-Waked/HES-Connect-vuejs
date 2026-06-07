<script setup>
import { ref, watch,computed } from 'vue';
import { useDashboardStore } from '../../../stores/dashboard';

const props = defineProps({
  show: Boolean,
  job: Object,
  mode: { type: String, default: 'add' }
});

const emit = defineEmits(['close']);
const store = useDashboardStore();

const formData = ref({
  facility: '',
  author: '',
  title: '',
  description: '',
  status: 'pending',
  end_date: '',
  apply_method: 'email',
  apply_value: ''
});

const facilities = computed(() => store.facilities.map(f => f.name));

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.mode === 'edit' && props.job) {
      formData.value = { ...props.job };
    } else {
      formData.value = {
        facility: facilities.value[0] || '',
        author: '',
        title: '',
        description: '',
        status: 'pending',
        end_date: '',
        apply_method: 'email',
        apply_value: ''
      };
    }
  }
});

const handleSubmit = () => {
  if (props.mode === 'edit') {
    store.updateJob(props.job.id, formData.value);
  } else {
    store.addJob(formData.value);
  }
  emit('close');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 class="text-lg font-bold text-slate-900">
          {{ mode === 'edit' ? 'Edit Job Post' : 'Post New Job' }}
        </h3>
        <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Title -->
          <div class="sm:col-span-2 space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</label>
            <input v-model="formData.title" type="text" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition" placeholder="e.g. Senior Nurse"/>
          </div>

          <!-- Facility -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Facility</label>
            <select v-model="formData.facility" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary transition cursor-pointer">
              <option v-for="f in facilities" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>

          <!-- Author -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Posted By</label>
            <input v-model="formData.author" type="text" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition" placeholder="Your name"/>
          </div>

          <!-- End Date -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Application Deadline</label>
            <input v-model="formData.end_date" type="text" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary transition" placeholder="e.g. Jul 15, 2026"/>
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select v-model="formData.status" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary transition cursor-pointer">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <!-- Apply Method -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Apply via</label>
            <select v-model="formData.apply_method" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary transition cursor-pointer">
              <option value="email">Email Address</option>
              <option value="link">External Link</option>
            </select>
          </div>

          <!-- Apply Value -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Apply Detail</label>
            <input v-model="formData.apply_value" type="text" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition" :placeholder="formData.apply_method === 'email' ? 'hr@example.com' : 'https://...'"/>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Description</label>
          <textarea v-model="formData.description" required rows="4" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition resize-none" placeholder="Describe the role..."></textarea>
        </div>

        <!-- Footer -->
        <div class="pt-4 flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">Cancel</button>
          <button type="submit" class="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-primary/20 transition cursor-pointer">
            {{ mode === 'edit' ? 'Update Post' : 'Publish Job' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-in { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
