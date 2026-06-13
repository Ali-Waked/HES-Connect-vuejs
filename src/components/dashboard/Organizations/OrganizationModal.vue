<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useOrganizations } from '../../../composables/useOrganizations';

const props = defineProps({
  show: { type: Boolean, required: true },
  org: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { createOrganization, updateOrganization, fetchOrganization, saving } = useOrganizations();

const name_en = ref('');
const name_ar = ref('');
const description_en = ref('');
const description_ar = ref('');
const type = ref('');
const loadingOrg = ref(false);

watch(
  () => props.org,
  async (newOrg) => {
    loadingOrg.value = false;
    if (newOrg && newOrg.uuid) {
      loadingOrg.value = true;
      try {
        const data = await fetchOrganization(newOrg.uuid);
        name_en.value = data.name?.en || '';
        name_ar.value = data.name?.ar || '';
        description_en.value = data.description?.en || '';
        description_ar.value = data.description?.ar || '';
        type.value = data.type;
      } catch (err) {
        name_en.value = '';
        name_ar.value = '';
        description_en.value = '';
        description_ar.value = '';
        type.value = '';
      } finally {
        loadingOrg.value = false;
      }
    } else {
      name_en.value = '';
      name_ar.value = '';
      description_en.value = '';
      description_ar.value = '';
      type.value = '';
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  const data = {
    name_en: name_en.value,
    name_ar: name_ar.value,
    description_en: description_en.value,
    description_ar: description_ar.value,
    type: type.value
  };

  let result;
  if (props.org && props.org.id) {
    result = await updateOrganization(props.org.uuid, data);
  } else {
    result = await createOrganization(data);
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
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[520px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ org ? $t('common.edit') + ' ' + $t('organizations.type') : $t('common.add') + ' ' + $t('organizations.type') }}
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
        <div v-if="loadingOrg" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="orgNameEn">{{ $t('organizations.name_en') }} *</label>
              <input 
                id="orgNameEn" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition" 
                required 
                dir="ltr"
                :placeholder="$t('organizations.name_en')"
                v-model="name_en"
              />
            </div>
            
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="orgNameAr">{{ $t('organizations.name_ar') }} *</label>
              <input 
                id="orgNameAr" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition text-right" 
                required 
                dir="rtl"
                :placeholder="$t('organizations.name_ar')"
                v-model="name_ar"
              />
            </div>
          </div>
          
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="orgDescEn">{{ $t('common.description') }} (English) *</label>
            <textarea 
              id="orgDescEn" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none min-h-[80px]  transition resize-none" 
              required 
              dir="ltr"
              placeholder="Description in English..."
              v-model="description_en"
            ></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="orgDescAr">{{ $t('common.description') }} (Arabic) *</label>
            <textarea 
              id="orgDescAr" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none min-h-[80px] resize-none transition text-right" 
              required 
              dir="rtl"
              placeholder="الوصف باللغة العربية..."
              v-model="description_ar"
            ></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="orgType">{{ $t('organizations.type') }} *</label>
            <select 
              id="orgType" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition cursor-pointer" 
              required 
              v-model="type"
            >
              <option value="" disabled>Select Organization Type</option>
              <option value="government">Government</option>
              <option value="un_agency">UN Agency</option>
              <option value="international_ngo">International NGO</option>
              <option value="local_ngo">Local NGO</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div v-show="!loadingOrg" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
            {{ org ? $t('common.save') : $t('common.create') + ' ' + $t('organizations.type') }}
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
