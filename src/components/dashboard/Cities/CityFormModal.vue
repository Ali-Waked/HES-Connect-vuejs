<script setup>
import { watch, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '../global/BaseDialog.vue';
import { useCities } from '../../../composables/useCities';

const props = defineProps({
  show: { type: Boolean, required: true },
  city: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const { createCity, updateCity, saving } = useCities();

const form = reactive({
  name_en: '',
  name_ar: '',
  is_active: '1',
});

const validationErrors = ref({});

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.city) {
      form.name_en = props.city.name?.en || props.city.name_en || '';
      form.name_ar = props.city.name?.ar || props.city.name_ar || '';
      form.is_active = props.city.is_active ? '1' : '0';
    } else {
      form.name_en = '';
      form.name_ar = '';
      form.is_active = '1';
    }
    validationErrors.value = {};
  }
});

async function handleSubmit() {
  validationErrors.value = {};

  const data = {
    name_en: form.name_en,
    name_ar: form.name_ar,
    is_active: form.is_active === '1',
  };

  let result;
  if (props.city) {
    result = await updateCity(props.city.uuid, data);
  } else {
    result = await createCity(data);
  }

  if (result.success) {
    emit('close');
  } else if (result.errors) {
    validationErrors.value = result.errors;
  }
}
</script>

<template>
  <BaseDialog
    :show="show"
    :title="city ? $t('cities.edit') : $t('cities.add')"
    size="md"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('cities.name_en') }} *</label>
          <input
            type="text"
            class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
            :class="{ 'border-rose-500': validationErrors['name.en'] }"
            required
            dir="ltr"
            :placeholder="$t('cities.name_en')"
            v-model="form.name_en"
          />
          <p v-if="validationErrors['name.en']" class="text-xs text-rose-600">{{ validationErrors['name.en'][0] }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('cities.name_ar') }} *</label>
          <input
            type="text"
            class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right"
            :class="{ 'border-rose-500': validationErrors['name.ar'] }"
            required
            dir="rtl"
            :placeholder="$t('cities.name_ar')"
            v-model="form.name_ar"
          />
          <p v-if="validationErrors['name.ar']" class="text-xs text-rose-600">{{ validationErrors['name.ar'][0] }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('cities.status') }}</label>
        <select
          v-model="form.is_active"
          class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer"
        >
          <option value="1">{{ $t('cities.active') }}</option>
          <option value="0">{{ $t('cities.inactive') }}</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          @click="$emit('close')"
          class="py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
        >
          <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {{ city ? $t('common.save') : $t('common.create') }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
