<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '../global/BaseDialog.vue';
import PermissionSelector from '../global/PermissionSelector.vue';
import { useRoles } from '../../../composables/useRoles';

const props = defineProps({
  show: { type: Boolean, required: true },
  role: { type: Object, default: null },
  allPermissions: { type: Array, default: () => [] }
});

const emit = defineEmits(['close']);
const { createRole, updateRole, saving } = useRoles();
const { t: $t } = useI18n();

const form = reactive({
  name: { en: '', ar: '' },
  permissions: []
});

const errors = reactive({ name_en: '', name_ar: '' });

watch(() => props.show, (val) => {
  if (val) {
    if (props.role) {
      form.name = { ...(props.role.name || { en: '', ar: '' }) };
      form.permissions = (props.role.permissions || []).map(p => p.uuid || p);
    } else {
      form.name = { en: '', ar: '' };
      form.permissions = [];
    }
    errors.name_en = '';
    errors.name_ar = '';
  }
});

const validate = () => {
  let valid = true;
  errors.name_en = '';
  errors.name_ar = '';
  if (!form.name.en.trim()) { errors.name_en = $t('common.required'); valid = false }
  if (!form.name.ar.trim()) { errors.name_ar = $t('common.required'); valid = false }
  return valid;
};

const handleSubmit = async () => {
  if (!validate()) return;

  let result;
  if (props.role) {
    result = await updateRole(props.role.uuid, { ...form });
  } else {
    result = await createRole({ ...form });
  }

  if (result.success) {
    emit('close');
  }
};
</script>

<template>
  <BaseDialog
    :show="show"
    :title="role ? $t('access.edit_role') : $t('access.create_role')"
    size="lg"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="roleNameEn">{{ $t('access.role_name_en') }} *</label>
          <input
            id="roleNameEn"
            type="text"
            class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
            required
            dir="ltr"
            :placeholder="$t('access.role_name_en')"
            v-model="form.name.en"
          />
          <p v-if="errors.name_en" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.name_en }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="roleNameAr">{{ $t('access.role_name_ar') }} *</label>
          <input
            id="roleNameAr"
            type="text"
            class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right"
            required
            dir="rtl"
            :placeholder="$t('access.role_name_ar')"
            v-model="form.name.ar"
          />
          <p v-if="errors.name_ar" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.name_ar }}</p>
        </div>
      </div>

      <PermissionSelector
        v-model="form.permissions"
        :permissions="allPermissions"
        :label="$t('access.assign_permissions')"
      />

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
          :disabled="saving"
          class="py-2.5 px-8 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition inline-flex items-center gap-2"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          {{ role ? $t('common.save') : $t('access.create_role') }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
