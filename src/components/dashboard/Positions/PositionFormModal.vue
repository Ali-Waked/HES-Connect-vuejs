<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePositions } from '../../../composables/usePositions';

const props = defineProps({
  show: { type: Boolean, required: true },
  position: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { createPosition, updatePosition, fetchPosition, saving } = usePositions();

const name_en = ref('');
const name_ar = ref('');
const description_en = ref('');
const description_ar = ref('');
const is_active = ref(true);
const loadingPosition = ref(false);
const validationErrors = ref({});

watch(() => props.show, (val) => {
  if (val) validationErrors.value = {};
});

watch(() => props.position, async (newPosition) => {
  loadingPosition.value = false;
  if (newPosition && newPosition.uuid) {
    loadingPosition.value = true;
    try {
      const data = await fetchPosition(newPosition.uuid);
      name_en.value = data.name?.en || '';
      name_ar.value = data.name?.ar || '';
      description_en.value = data.description?.en || '';
      description_ar.value = data.description?.ar || '';
      is_active.value = data.is_active ?? true;
    } catch (err) {
      resetForm();
    } finally {
      loadingPosition.value = false;
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
  is_active.value = true;
  validationErrors.value = {};
}

const submitForm = async () => {
  validationErrors.value = {};
  const data = {
    name_en: name_en.value,
    name_ar: name_ar.value,
    description_en: description_en.value,
    description_ar: description_ar.value,
    is_active: is_active.value,
  };

  let result;
  if (props.position && props.position.uuid) {
    result = await updatePosition(props.position.uuid, data);
  } else {
    result = await createPosition(data);
  }

  if (result.success) {
    emit('close');
  } else if (result.errors) {
    validationErrors.value = result.errors;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[580px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ position && position.uuid ? $t('positions.edit') : $t('positions.add') }}
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
        <div v-if="loadingPosition" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="posNameEn">{{ $t('positions.nameEn') }} *</label>
              <input
                id="posNameEn"
                type="text"
                class="w-full p-2.5 text-sm border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
                :class="validationErrors['name.en'] ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'"
                required
                dir="ltr"
                placeholder="Hospital Director"
                v-model="name_en"
              />
              <p v-if="validationErrors['name.en']" class="text-xs text-rose-600">{{ validationErrors['name.en'][0] }}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="posNameAr">{{ $t('positions.nameAr') }} *</label>
              <input
                id="posNameAr"
                type="text"
                class="w-full p-2.5 text-sm border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right"
                :class="validationErrors['name.ar'] ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'"
                required
                dir="rtl"
                placeholder="مدير منشأة"
                v-model="name_ar"
              />
              <p v-if="validationErrors['name.ar']" class="text-xs text-rose-600">{{ validationErrors['name.ar'][0] }}</p>
            </div>
          </div>

          <!-- Description Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="posDescEn">{{ $t('positions.descriptionEn') }}</label>
              <textarea
                id="posDescEn"
                rows="3"
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition resize-none"
                dir="ltr"
                :placeholder="$t('positions.descriptionEnPlaceholder')"
                v-model="description_en"
              ></textarea>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="posDescAr">{{ $t('positions.descriptionAr') }}</label>
              <textarea
                id="posDescAr"
                rows="3"
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition resize-none text-right"
                dir="rtl"
                :placeholder="$t('positions.descriptionArPlaceholder')"
                v-model="description_ar"
              ></textarea>
            </div>
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('positions.status') }}</label>
            <div class="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                :aria-checked="is_active"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                :class="is_active ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'"
                @click="is_active = !is_active"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                  :class="is_active ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
              <span class="inline-flex items-center gap-1.5 text-sm font-medium" :class="is_active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'">
                <span class="w-1.5 h-1.5 rounded-full" :class="is_active ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'"></span>
                {{ is_active ? $t('positions.active') : $t('positions.inactive') }}
              </span>
            </div>
          </div>
        </div>

        <div v-show="!loadingPosition" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
            {{ position && position.uuid ? $t('common.save') : $t('positions.add') }}
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
