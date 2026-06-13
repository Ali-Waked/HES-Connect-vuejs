<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '../global/BaseDialog.vue';
import PermissionSelector from '../global/PermissionSelector.vue';
import LocalizedInput from '@/components/shared/localized/LocalizedInput.vue';
import { useAccessStore } from '../../../stores/access';

const props = defineProps({
  show: { type: Boolean, required: true },
  role: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useAccessStore();
const { t: $t } = useI18n();

const form = reactive({
  name: { en: '', ar: '' },
  permissions: []
});

const errors = reactive({ name: '' });

watch(() => props.show, (val) => {
  if (isShowing) {
    if (props.role) {
      form.name = { en: props.role.name?.en || props.role.name_en || '', ar: props.role.name?.ar || props.role.name_ar || '' };
      form.permissions = [...(props.role.permissions || [])];
    } else {
      form.name = { en: '', ar: '' };
      form.permissions = [];
    }
    errors.name = '';
  }
});

const validate = () => {
  errors.name = '';
  if (!form.name.en?.trim()) { errors.name = $t('common.required'); return false }
  if (!form.name.ar?.trim()) { errors.name = $t('common.required'); return false }
  return true;
};

const handleSubmit = () => {
  if (!validate()) return;

  const payload = {
    name: { en: form.name.en.trim(), ar: form.name.ar.trim() },
    permissions: form.permissions
  };

  if (props.role) {
    store.updateRole(props.role.id, payload);
  } else {
    store.addRole(payload);
  }
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    :title="role ? $t('common.editRole') : $t('common.createNewRole')" 
    size="lg"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <LocalizedInput v-model="form.name" field="name" :label="$t('common.name')" required :error="errors.name" />

      <PermissionSelector 
        v-model="form.permissions"
        :permissions="store.permissions"
        label="Assign Permissions to Role"
      />
      <p v-if="errors.permissions" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.permissions }}</p>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          type="button"
          @click="$emit('close')"
          class="py-2.5 px-6 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold rounded-lg transition"
        >
          {{ $t('common.cancel') }}
        </button>
        <button 
          type="submit"
          class="py-2.5 px-8 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition"
        >
          {{ role ? $t('common.saveChanges') : $t('common.createRole') }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
