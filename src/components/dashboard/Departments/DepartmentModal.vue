<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useDepartments } from '../../../composables/useDepartments';
import { getFacilities } from '../../../services/facilityService';
import { getStaff } from '../../../services/staffService';
import ImageUploader from '../global/ImageUploader.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  department: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { createDepartment, updateDepartment, fetchDepartment, saving } = useDepartments();

const name_en = ref('');
const name_ar = ref('');
const description_en = ref('');
const description_ar = ref('');
const facility_id = ref('');
const head_id = ref('');
const image = ref(null);
const is_active = ref(true);
const loadingDep = ref(false);

const facilities = ref([]);
const staffList = ref([]);

watch(() => props.show, async (val) => {
  if (val) {
    if (facilities.value.length === 0) {
      try {
        const { data } = await getFacilities({ per_page: 1000 })
        facilities.value = data.data
      } catch (e) {
        // silently fail for dropdown
      }
    }
    if (staffList.value.length === 0) {
      try {
        const { data } = await getStaff({ per_page: 1000 })
        staffList.value = data.data
      } catch (e) {
        // silently fail for dropdown
      }
    }
  }
});

watch(
  () => props.department,
  async (newDep) => {
    loadingDep.value = false;
    if (newDep && newDep.uuid) {
      loadingDep.value = true;
      try {
        const data = await fetchDepartment(newDep.uuid);
        console.log('data',data,props.department);
        name_en.value = data.name?.en || '';
        name_ar.value = data.name?.ar || '';
        description_en.value = data.description?.en || '';
        description_ar.value = data.description?.ar || '';
        facility_id.value = data.facility_id || '';
        head_id.value = data.head_id || '';
        image.value = data.image || null;
        is_active.value = data.is_active === 1 || data.is_active === true;
      } catch (err) {
        resetForm();
      } finally {
        loadingDep.value = false;
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  name_en.value = '';
  name_ar.value = '';
  description_en.value = '';
  description_ar.value = '';
  facility_id.value = '';
  head_id.value = '';
  image.value = null;
  is_active.value = true;
}

const submitForm = async () => {
  const data = {
    name_en: name_en.value,
    name_ar: name_ar.value,
    description_en: description_en.value,
    description_ar: description_ar.value,
    facility_id: facility_id.value,
    head_id: head_id.value || null,
    image: image.value,
    is_active: is_active.value,
  };

  let result;
  if (props.department && props.department.uuid) {
    result = await updateDepartment(props.department.uuid, data);
  } else {
    result = await createDepartment(data);
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
      <!-- Modal Header -->
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ department && department.uuid ? $t('departments.editDepartment') || 'Edit Department' : $t('departments.addDepartment') }}
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
        <div v-if="loadingDep" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="depNameEn">{{ $t('departments.name_en') }} *</label>
              <input 
                id="depNameEn" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" 
                required 
                dir="ltr"
                :placeholder="$t('departments.name_en')"
                v-model="name_en"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="depNameAr">{{ $t('departments.name_ar') }} *</label>
              <input 
                id="depNameAr" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right" 
                required 
                dir="rtl"
                :placeholder="$t('departments.name_ar')"
                v-model="name_ar"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="depDescEn">{{ $t('common.description') }} (English)</label>
            <textarea 
              id="depDescEn" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition" 
              dir="ltr"
              placeholder="Description in English..."
              v-model="description_en"
            ></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="depDescAr">{{ $t('common.description') }} (Arabic)</label>
            <textarea 
              id="depDescAr" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition text-right" 
              dir="rtl"
              placeholder="الوصف باللغة العربية..."
              v-model="description_ar"
            ></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="depFacility">{{ $t('departments.facility') || 'Facility' }} *</label>
            <select 
              id="depFacility"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer"
              required
              v-model="facility_id"
            >
              <option value="" disabled>{{ $t('common.select') || 'Select' }} {{ $t('departments.facility') || 'Facility' }}</option>
              <option v-for="fac in facilities" :key="fac.uuid || fac.id" :value="fac.uuid || fac.id">
                {{ localField(fac, 'name') }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="depHead">{{ $t('departments.head') }}</label>
            <select 
              id="depHead"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer"
              v-model="head_id"
            >
              <option value="">{{ $t('common.none') || 'None' }}</option>
              <option v-for="staff in staffList" :key="staff.uuid || staff.id" :value="staff.uuid || staff.id">
                {{ localField(staff, 'name') }}
              </option>
            </select>
          </div>

          <ImageUploader v-model="image" :label="$t('departments.image') || 'Department Image'" aspect-ratio="aspect-video" />

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="depStatus">{{ $t('common.status') }}</label>
            <select 
              id="depStatus" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" 
              v-model="is_active"
            >
              <option :value="true">{{ $t('statuses.active') }}</option>
              <option :value="false">{{ $t('statuses.inactive') }}</option>
            </select>
          </div>
        </div>

        <div v-show="!loadingDep" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
            {{ department && department.uuid ? $t('common.save') : $t('departments.addDepartment') }}
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
