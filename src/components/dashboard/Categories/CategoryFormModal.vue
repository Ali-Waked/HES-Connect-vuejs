<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCategories } from '../../../composables/useCategories';

const props = defineProps({
  show: { type: Boolean, required: true },
  category: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { createCategory, updateCategory, fetchCategory, saving } = useCategories();

const name_en = ref('');
const name_ar = ref('');
const description_en = ref('');
const description_ar = ref('');
const type = ref('article');
const is_active = ref(true);
const loadingCat = ref(false);

const typeOptions = [
  { value: 'article', label: t('categoryManagement.article') },
  { value: 'story', label: t('categoryManagement.story') },
  { value: 'job', label: t('categoryManagement.job') },
];

const statusOptions = [
  { value: true, label: t('statuses.active') },
  { value: false, label: t('statuses.inactive') },
];

watch(() => props.category, async (newCat) => {
  loadingCat.value = false;
  if (newCat && newCat.uuid) {
    loadingCat.value = true;
    try {
      const data = await fetchCategory(newCat.uuid);
      name_en.value = data.name?.en || '';
      name_ar.value = data.name?.ar || '';
      description_en.value = data.description?.en || '';
      description_ar.value = data.description?.ar || '';
      type.value = data.type || 'article';
      is_active.value = data.is_active === 1 || data.is_active === true;
    } catch (err) {
      resetForm();
    } finally {
      loadingCat.value = false;
    }
  } else {
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  name_en.value = '';
  name_ar.value = '';
  description_en.value = '';
  description_ar.value = '';
  type.value = 'article';
  is_active.value = true;
}

const submitForm = async () => {
  const data = {
    name_en: name_en.value,
    name_ar: name_ar.value,
    description_en: description_en.value,
    description_ar: description_ar.value,
    type: type.value,
    is_active: is_active.value,
  };

  let result;
  if (props.category && props.category.uuid) {
    result = await updateCategory(props.category.uuid, data);
  } else {
    result = await createCategory(data);
  }

  if (result.success) {
    emit('close');
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[540px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ category && category.uuid ? $t('categoryManagement.editCategory') : $t('categoryManagement.addCategory') }}
        </h3>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="flex flex-col flex-1 overflow-hidden">
        <div v-if="loadingCat" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="catNameEn">{{ $t('categoryManagement.name_en') || 'Name (English)' }} *</label>
            <input
              id="catNameEn"
              type="text"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
              required
              :placeholder="$t('categoryManagement.name_en') || 'Name (English)'"
              v-model="name_en"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="catNameAr">{{ $t('categoryManagement.name_ar') || 'Name (Arabic)' }} *</label>
            <input
              id="catNameAr"
              type="text"
              dir="rtl"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
              required
              :placeholder="$t('categoryManagement.name_ar') || 'Name (Arabic)'"
              v-model="name_ar"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="catDescEn">{{ $t('categoryManagement.description_en') || 'Description (English)' }}</label>
            <textarea
              id="catDescEn"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition"
              dir="ltr"
              :placeholder="$t('categoryManagement.description_en') || 'Description (English)'"
              v-model="description_en"
            ></textarea>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="catDescAr">{{ $t('categoryManagement.description_ar') || 'Description (Arabic)' }}</label>
            <textarea
              id="catDescAr"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition text-right"
              dir="rtl"
              :placeholder="$t('categoryManagement.description_ar') || 'Description (Arabic)'"
              v-model="description_ar"
            ></textarea>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="catType">{{ $t('categoryManagement.type') }} *</label>
            <select
              id="catType"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer"
              required
              v-model="type"
            >
              <option value="" disabled>{{ $t('common.select') || 'Select' }} {{ $t('categoryManagement.type') }}</option>
              <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="catStatus">{{ $t('common.status') }} *</label>
            <select
              id="catStatus"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer"
              required
              v-model="is_active"
            >
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <div v-show="!loadingCat" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            @click="$emit('close')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {{ category && category.uuid ? $t('common.save') : $t('categoryManagement.addCategory') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
