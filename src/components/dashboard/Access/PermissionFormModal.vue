<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '../global/BaseDialog.vue';
import { useAccessStore } from '../../../stores/access';
import LocalizedInput from '@/components/shared/localized/LocalizedInput.vue';
import LocalizedTextarea from '@/components/shared/localized/LocalizedTextarea.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  permission: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useAccessStore();
const { t: $t } = useI18n();

const form = reactive({
  name: { en: '', ar: '' },
  description: { en: '', ar: '' },
});

const errors = reactive({ name: '', description: '' });

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.permission) {
      form.name = { en: props.permission.name?.en || props.permission.name_en || '', ar: props.permission.name?.ar || props.permission.name_ar || '' };
      form.description = { en: props.permission.description?.en || props.permission.description_en || '', ar: props.permission.description?.ar || props.permission.description_ar || '' };
    } else {
      form.name = { en: '', ar: '' };
      form.description = { en: '', ar: '' };
    }
    errors.name = '';
    errors.description = '';
  }
});

function validate() {
  let valid = true
  errors.name = ''
  errors.description = ''
  if (!form.name.en?.trim()) { errors.name = $t('common.required'); valid = false }
  if (!form.name.ar?.trim()) { errors.name = $t('common.required'); valid = false }
  return valid
}

const handleSubmit = () => {
  if (!validate()) return;

  if (props.permission) {
    store.updatePermission(props.permission.id, { name: form.name, description: form.description });
  } else {
    store.addPermission({ name: form.name, description: form.description });
  }
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    :title="permission ? $t('access.edit_permission') : $t('access.create_permission')" 
    size="md"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('access.permission_slug') }} <span class="text-rose-500">*</span></label>
        <LocalizedInput
          v-model="form.name"
          :error="errors.name"
          placeholder="e.g. users:view"
        />
        <p v-if="errors.name" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.name }}</p>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('access.description') }}</label>
        <LocalizedTextarea
          v-model="form.description"
          :error="errors.description"
          placeholder="What does this permission allow?"
        />
      </div>

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
          {{ permission ? $t('common.save_changes') : $t('access.create_permission') }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
