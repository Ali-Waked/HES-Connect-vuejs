<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSymptoms } from '../../../composables/useSymptoms';

const props = defineProps({
  show: { type: Boolean, required: true },
  symptom: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { createSymptom, updateSymptom, fetchSymptom, saving } = useSymptoms();

const name_en = ref('');
const name_ar = ref('');
const is_active = ref(true);
const loadingSymptom = ref(false);

watch(() => props.symptom, async (newSymptom) => {
  loadingSymptom.value = false;
  if (newSymptom && newSymptom.uuid) {
    loadingSymptom.value = true;
    try {
      const data = await fetchSymptom(newSymptom.uuid);
      name_en.value = data.name?.en || '';
      name_ar.value = data.name?.ar || '';
      is_active.value = data.is_active ?? true;
    } catch (err) {
      resetForm();
    } finally {
      loadingSymptom.value = false;
    }
  } else {
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  name_en.value = '';
  name_ar.value = '';
  is_active.value = true;
}

const submitForm = async () => {
  const data = {
    name_en: name_en.value,
    name_ar: name_ar.value,
    is_active: is_active.value,
  };

  let result;
  if (props.symptom && props.symptom.uuid) {
    result = await updateSymptom(props.symptom.uuid, data);
  } else {
    result = await createSymptom(data);
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
          {{ symptom && symptom.uuid ? $t('symptoms.edit') : $t('symptoms.add') }}
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
        <div v-if="loadingSymptom" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="symptomNameEn">{{ $t('symptoms.nameEn') }} *</label>
            <input
              id="symptomNameEn"
              type="text"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
              required
              dir="ltr"
              :placeholder="$t('symptoms.nameEn')"
              v-model="name_en"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="symptomNameAr">{{ $t('symptoms.nameAr') }} *</label>
            <input
              id="symptomNameAr"
              type="text"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right"
              required
              dir="rtl"
              :placeholder="$t('symptoms.nameAr')"
              v-model="name_ar"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="symptomStatus">{{ $t('symptoms.status') }}</label>
            <button
              id="symptomStatus"
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer"
              :class="is_active ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'"
              @click="is_active = !is_active"
              role="switch"
              :aria-checked="is_active"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition" :class="is_active ? 'translate-x-6' : 'translate-x-1'" />
            </button>
            <span class="text-sm text-slate-600 dark:text-slate-400">{{ is_active ? $t('symptoms.active') : $t('symptoms.inactive') }}</span>
          </div>
        </div>

        <div v-show="!loadingSymptom" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
            {{ symptom && symptom.uuid ? $t('common.save') : $t('symptoms.add') }}
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
