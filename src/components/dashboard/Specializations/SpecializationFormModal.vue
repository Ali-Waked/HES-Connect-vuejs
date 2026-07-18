<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSpecializations } from '../../../composables/useSpecializations';

const props = defineProps({
  show: { type: Boolean, required: true },
  specialization: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { createSpecialization, updateSpecialization, fetchSpecialization, saving } = useSpecializations();

const name_en = ref('');
const name_ar = ref('');
const description_en = ref('');
const description_ar = ref('');
const loadingSpec = ref(false);

watch(() => props.specialization, async (newSpec) => {
  loadingSpec.value = false;
  if (newSpec && newSpec.uuid) {
    loadingSpec.value = true;
    try {
      const data = await fetchSpecialization(newSpec.uuid);
      name_en.value = data.name?.en || '';
      name_ar.value = data.name?.ar || '';
      description_en.value = data.description?.en || '';
      description_ar.value = data.description?.ar || '';
    } catch {
      resetForm();
    } finally {
      loadingSpec.value = false;
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
}

const submitForm = async () => {
  const data = {
    name_en: name_en.value,
    name_ar: name_ar.value,
    description_en: description_en.value,
    description_ar: description_ar.value,
  };

  let result;
  if (props.specialization && props.specialization.uuid) {
    result = await updateSpecialization(props.specialization.uuid, data);
  } else {
    result = await createSpecialization(data);
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
          {{ specialization && specialization.uuid ? $t('specializations.edit') : $t('specializations.add') }}
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
        <div v-if="loadingSpec" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="specNameEn">{{ $t('specializations.nameEn') }} *</label>
            <input
              id="specNameEn"
              type="text"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
              required
              dir="ltr"
              :placeholder="$t('specializations.nameEn')"
              v-model="name_en"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="specNameAr">{{ $t('specializations.nameAr') }} *</label>
            <input
              id="specNameAr"
              type="text"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right"
              required
              dir="rtl"
              :placeholder="$t('specializations.nameAr')"
              v-model="name_ar"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="specDescEn">{{ $t('specializations.descEn') }}</label>
            <textarea
              id="specDescEn"
              rows="3"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition resize-none"
              dir="ltr"
              :placeholder="$t('specializations.descEn')"
              v-model="description_en"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="specDescAr">{{ $t('specializations.descAr') }}</label>
            <textarea
              id="specDescAr"
              rows="3"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition resize-none text-right"
              dir="rtl"
              :placeholder="$t('specializations.descAr')"
              v-model="description_ar"
            />
          </div>
        </div>

        <div v-show="!loadingSpec" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
            {{ specialization && specialization.uuid ? $t('common.save') : $t('specializations.add') }}
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
