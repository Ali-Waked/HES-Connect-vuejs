<script setup>
import { ref, watch } from 'vue';
import BaseDialog from '../global/BaseDialog.vue';
import PermissionSelector from '../global/PermissionSelector.vue';
import { useAccessStore } from '../../../stores/access';

const props = defineProps({
  show: { type: Boolean, required: true },
  role: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useAccessStore();

const form = ref({
  name: '',
  permissions: []
});

const errors = ref({});

watch(() => props.show, (val) => {
  if (isShowing) {
    if (props.role) {
      form.value = { 
        name: props.role.name,
        permissions: [...props.role.permissions]
      };
    } else {
      form.value = { name: '', permissions: [] };
    }
    errors.value = {};
  }
});

const validate = () => {
  errors.value = {};
  if (!form.value.name.trim()) errors.value.name = 'Role name is required';
  if (form.value.permissions.length === 0) errors.value.permissions = 'At least one permission is required';
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;

  if (props.role) {
    store.updateRole(props.role.id, form.value);
  } else {
    store.addRole(form.value);
  }
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    :title="role ? 'Edit Role' : 'Create New Role'" 
    size="lg"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Role Name <span class="text-rose-500">*</span></label>
        <input 
          v-model="form.name"
          type="text"
          class="w-full p-3 text-sm border rounded-xl focus:outline-none transition"
          :class="errors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'"
          placeholder="e.g. Facility Manager"
        />
        <p v-if="errors.name" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.name }}</p>
      </div>

      <PermissionSelector 
        v-model="form.permissions"
        :permissions="store.permissions"
        label="Assign Permissions to Role"
      />
      <p v-if="errors.permissions" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.permissions }}</p>

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
          {{ role ? 'Save Changes' : 'Create Role' }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
