<script setup>
import { ref, watch } from 'vue';
import BaseDialog from '../global/BaseDialog.vue';
import { useAccessStore } from '../../../stores/access';

const props = defineProps({
  show: { type: Boolean, required: true },
  permission: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useAccessStore();

const form = ref({
  name: '',
  description: ''
});

const errors = ref({});

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.permission) {
      form.value = { ...props.permission };
    } else {
      form.value = { name: '', description: '' };
    }
    errors.value = {};
  }
});

const validate = () => {
  errors.value = {};
  if (!form.value.name.trim()) errors.value.name = 'Permission name is required';
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;

  if (props.permission) {
    store.updatePermission(props.permission.id, form.value);
  } else {
    store.addPermission(form.value);
  }
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    :title="permission ? 'Edit Permission' : 'Create Permission'" 
    size="md"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Permission Slug <span class="text-rose-500">*</span></label>
        <input 
          v-model="form.name"
          type="text"
          class="w-full p-3 text-sm border rounded-xl focus:outline-none transition"
          :class="errors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'"
          placeholder="e.g. users:view"
        />
        <p v-if="errors.name" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.name }}</p>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
        <textarea 
          v-model="form.description"
          rows="3"
          class="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none transition resize-none"
          placeholder="What does this permission allow?"
        ></textarea>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button"
          @click="$emit('close')"
          class="py-2.5 px-6 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-lg transition"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="py-2.5 px-8 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition"
        >
          {{ permission ? 'Save Changes' : 'Create Permission' }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
