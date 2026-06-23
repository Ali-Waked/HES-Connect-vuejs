<script setup>
import { watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '../global/BaseDialog.vue';
import ImageUploader from '../global/ImageUploader.vue';
import { useMedicinesStore } from '../../../stores/medicines';

const props = defineProps({
  show: { type: Boolean, required: true },
  medicine: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useMedicinesStore();
const { t } = useI18n();

const form = reactive({
  name: { en: '', ar: '' },
  description: { en: '', ar: '' },
  image: null,
  category: '',
  price: '',
  quantity: '',
  manufacturer: '',
});

const errors = reactive({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '' });

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.medicine) {
      const item = props.medicine;
      form.name = { en: item.name?.en || item.name_en || '', ar: item.name?.ar || item.name_ar || '' };
      form.description = { en: item.description?.en || item.description_en || '', ar: item.description?.ar || item.description_ar || '' };
      form.category = item.category || '';
      form.price = item.price || '';
      form.quantity = item.quantity || '';
      form.manufacturer = item.manufacturer || '';
      form.image = item.image_url || item.image || null;
    } else {
      form.name = { en: '', ar: '' };
      form.description = { en: '', ar: '' };
      form.category = '';
      form.price = '';
      form.quantity = '';
      form.manufacturer = '';
      form.image = null;
    }
    errors.nameEn = '';
    errors.nameAr = '';
    errors.descriptionEn = '';
    errors.descriptionAr = '';
  }
});

const validate = () => {
  let valid = true;
  errors.nameEn = '';
  errors.nameAr = '';
  errors.descriptionEn = '';
  errors.descriptionAr = '';
  if (!form.name.en?.trim()) { errors.nameEn = t('common.required'); valid = false; }
  if (!form.name.ar?.trim()) { errors.nameAr = t('common.required'); valid = false; }
  if (!form.description.en?.trim()) { errors.descriptionEn = t('common.required'); valid = false; }
  if (!form.description.ar?.trim()) { errors.descriptionAr = t('common.required'); valid = false; }
  return valid;
};

const handleSubmit = async () => {
  if (!validate()) return;

  const payload = { ...form };

  if (props.medicine) {
    await store.updateMedicine(props.medicine.uuid, payload);
  } else {
    await store.createMedicine(payload);
  }
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    :title="medicine ? $t('medicines.editMedicine') : $t('medicines.addMedicine')" 
    size="md"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Name (EN) *</label>
          <input
            v-model="form.name.en"
            type="text"
            placeholder="Medicine name in English"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
          <p v-if="errors.nameEn" class="text-xs text-rose-500 mt-1">{{ errors.nameEn }}</p>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Name (AR) *</label>
          <input
            v-model="form.name.ar"
            type="text"
            placeholder="اسم الدواء بالعربية"
            dir="rtl"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
          <p v-if="errors.nameAr" class="text-xs text-rose-500 mt-1">{{ errors.nameAr }}</p>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Description (EN) *</label>
        <textarea
          v-model="form.description.en"
          placeholder="Medicine description in English"
          rows="3"
          class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition resize-none"
        ></textarea>
        <p v-if="errors.descriptionEn" class="text-xs text-rose-500 mt-1">{{ errors.descriptionEn }}</p>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Description (AR) *</label>
        <textarea
          v-model="form.description.ar"
          placeholder="وصف الدواء بالعربية"
          dir="rtl"
          rows="3"
          class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition resize-none"
        ></textarea>
        <p v-if="errors.descriptionAr" class="text-xs text-rose-500 mt-1">{{ errors.descriptionAr }}</p>
      </div>

      <ImageUploader v-model="form.image" label="Medicine Image" />

      <div class="flex justify-end gap-3 pt-4">
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
          {{ medicine ? $t('common.save') : $t('medicines.addMedicine') }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
