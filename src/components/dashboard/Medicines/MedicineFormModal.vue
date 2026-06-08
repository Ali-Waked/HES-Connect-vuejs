<script setup>
import { ref, watch } from 'vue';
import BaseDialog from '../global/BaseDialog.vue';
import ImageUploader from '../global/ImageUploader.vue';
import { useMedicinesStore } from '../../../stores/medicines';

const props = defineProps({
  show: { type: Boolean, required: true },
  medicine: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useMedicinesStore();

const form = ref({
  name: '',
  description: '',
  image: ''
});

const errors = ref({});

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.medicine) {
      form.value = { ...props.medicine };
    } else {
      form.value = { name: '', description: '', image: '' };
    }
    errors.value = {};
  }
});

const validate = () => {
  errors.value = {};
  if (!form.value.name.trim()) errors.value.name = 'Medicine name is required';
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;

  if (props.medicine) {
    store.updateMedicine(props.medicine.id, form.value);
  } else {
    store.addMedicine(form.value);
  }
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    :title="medicine ? 'Edit Medicine' : 'Add New Medicine'" 
    size="md"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Medicine Name <span class="text-rose-500">*</span></label>
        <input 
          v-model="form.name"
          type="text"
          class="w-full p-3 text-sm border rounded-xl focus:outline-none transition"
          :class="errors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'"
          placeholder="e.g. Paracetamol 500mg"
        />
        <p v-if="errors.name" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors.name }}</p>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
        <textarea 
          v-model="form.description"
          rows="4"
          class="w-full p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none transition resize-none"
          placeholder="Brief description of the medicine and its uses..."
        ></textarea>
      </div>

      <ImageUploader v-model="form.image" label="Medicine Image" />

      <div class="flex justify-end gap-3 pt-4">
        <button 
          type="button"
          @click="$emit('close')"
          class="py-2.5 px-6 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold rounded-lg transition"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="py-2.5 px-8 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition"
        >
          {{ medicine ? 'Save Changes' : 'Create Medicine' }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
