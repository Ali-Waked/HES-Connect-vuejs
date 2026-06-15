<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFacilities } from '../../../composables/useFacilities';
import { useOrganizations } from '../../../composables/useOrganizations';
import ImageUploader from '../global/ImageUploader.vue';
import MultipleImageUploader from '../global/MultipleImageUploader.vue';
import FileUploader from '../global/FileUploader.vue';
import { getFacilities } from '../../../services/facilityService';
import { getCitiesLookup } from '../../../services/cityService';

const props = defineProps({
  show: { type: Boolean, required: true },
  facility: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { createFacility, updateFacility, fetchFacility, saving } = useFacilities();
const { organizations, fetchAllOrganizations } = useOrganizations();

const name_en = ref('');
const name_ar = ref('');
const description_en = ref('');
const description_ar = ref('');
const type = ref('medical_point');
const organization_id = ref('');
const parent_id = ref('');
const location = ref('');
const status = ref('pending');
const approval_status = ref('pending');
const cover_image = ref(null);
const city_id = ref('');
const gallery_images = ref([]);
const files = ref([]);
const loadingFac = ref(false);
const coverValidationError = ref('');

watch(
  () => props.facility,
  async (newFac) => {
    loadingFac.value = false;
    if (newFac && newFac.uuid) {
      loadingFac.value = true;
      try {
        const data = await fetchFacility(newFac.uuid);
        name_en.value = data.name?.en || '';
        name_ar.value = data.name?.ar || '';
        description_en.value = data.description?.en || '';
        description_ar.value = data.description?.ar || '';
        type.value = data.type || 'medical_point';
        organization_id.value = data.organization_id || '';
        parent_id.value = data.parent_id || '';
        city_id.value = data.city_id || '';
        const lat = data.latitude ?? data.lat;
        const lng = data.longitude ?? data.lng;
        location.value = data.location || (lat != null && lng != null ? `${lat}, ${lng}` : '');
        status.value = data.status || 'pending';
        approval_status.value = data.approval_status || 'pending';
        cover_image.value = data.cover_image || null;
        gallery_images.value = data.gallery_images || [];
        files.value = data.files || [];
      } catch (err) {
        resetForm();
      } finally {
        loadingFac.value = false;
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
  type.value = 'medical_point';
  organization_id.value = '';
  parent_id.value = '';
  city_id.value = '';
  location.value = '';
  status.value = 'pending';
  approval_status.value = 'pending';
  cover_image.value = null;
  gallery_images.value = [];
  files.value = [];
  coverValidationError.value = '';
}

const parentFacilities = ref([]);
const citiesList = ref([]);

watch(() => props.show, async (val) => {
  if (val) {
    if (organizations.value?.length === 0 || organizations.value === undefined) {
      fetchAllOrganizations();
    }
    if (parentFacilities.value.length === 0) {
      try {
        const { data } = await getFacilities({ per_page: 1000, page: 1 })
        parentFacilities.value = data.data
      } catch (e) {
        // silently fail for dropdown
      }
    }
    if (citiesList.value.length === 0) {
      try {
        const { data } = await getCitiesLookup()
        citiesList.value = data.data || data
      } catch (e) {
        // silently fail for dropdown
      }
    }
  }
});

const submitForm = async () => {
  if (coverValidation()) {
    const data = {
      name_en: name_en.value,
      name_ar: name_ar.value,
      description_en: description_en.value,
      description_ar: description_ar.value,
        type: type.value,
        organization_id: organization_id.value,
        parent_id: parent_id.value || null,
        city_id: city_id.value || null,
      location: location.value,
      status: status.value,
      approval_status: approval_status.value,
      cover_image: cover_image.value,
      gallery_images: gallery_images.value,
      files: files.value,
    };

    let result;
    if (props.facility && props.facility.uuid) {
      result = await updateFacility(props.facility.uuid, data);
    } else {
      result = await createFacility(data);
    }

    if (result.success) {
      emit('close');
    }
  }
};

function coverValidation() {
  if (!props.facility || !props.facility.uuid) {
    if (!cover_image.value) {
      coverValidationError.value = t('facilities.coverImageRequired') || 'Cover image is required';
      return false;
    }
    if (typeof cover_image.value !== 'string' && !(cover_image.value instanceof File)) {
      coverValidationError.value = t('facilities.coverImageRequired') || 'Cover image is required';
      return false;
    }
  }
  coverValidationError.value = '';
  return true;
}
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[600px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <!-- Modal Header -->
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ facility && facility.uuid ? $t('facilities.editFacility') : $t('facilities.addFacility') }}
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
        <div v-if="loadingFac" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facNameEn">{{ $t('facilities.name_en') }} *</label>
              <input 
                id="facNameEn" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" 
                required 
                dir="ltr"
                :placeholder="$t('facilities.name_en')"
                v-model="name_en"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facNameAr">{{ $t('facilities.name_ar') }} *</label>
              <input 
                id="facNameAr" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right" 
                required 
                dir="rtl"
                :placeholder="$t('facilities.name_ar')"
                v-model="name_ar"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facDescEn">{{ $t('common.description') }} (English)</label>
            <textarea 
              id="facDescEn" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition" 
              dir="ltr"
              placeholder="Description in English..."
              v-model="description_en"
            ></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facDescAr">{{ $t('common.description') }} (Arabic)</label>
            <textarea 
              id="facDescAr" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition text-right" 
              dir="rtl"
              placeholder="الوصف باللغة العربية..."
              v-model="description_ar"
            ></textarea>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facType">{{ $t('facilities.type') }} *</label>
            <select 
              id="facType" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" 
              required 
              v-model="type"
            >
              <option value="" disabled>Select Facility Type</option>
              <option value="medical_point">{{ $t('categories.medicalPoint') }}</option>
              <option value="pharmacy">{{ $t('categories.pharmacy') }}</option>
              <option value="clinic">{{ $t('categories.clinic') }}</option>
              <option value="hospital">{{ $t('categories.hospital') }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facOrg">{{ $t('facilities.organization') }} *</label>
            <select 
              id="facOrg" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" 
              required 
              v-model="organization_id"
            >
              <option value="" disabled>Select Organization</option>
              <option v-for="org in organizations" :key="org.uuid" :value="org.uuid">
                {{ localField(org, 'name') }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facCity">{{ $t('facilities.city') || 'City' }}</label>
            <select
              id="facCity"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer"
              v-model="city_id"
            >
              <option value="">{{ $t('common.select') || 'Select' }} {{ $t('facilities.city') || 'City' }}</option>
              <option v-for="c in citiesList" :key="c.uuid || c.id" :value="c.uuid || c.id">
                {{ c.name?.en || c.name_en || c.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facParent">{{ $t('facilities.parentFacility') }}</label>
            <select 
              id="facParent" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" 
              v-model="parent_id"
            >
              <option value="">{{ $t('facilities.noParent') }}</option>
              <option v-for="fac in parentFacilities" :key="fac.uuid" :value="fac.uuid" :disabled="fac.uuid === (facility?.uuid)">
                {{ localField(fac, 'name') }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facStatus">{{ $t('common.status') }}</label>
              <select 
                id="facStatus" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" 
                v-model="status"
              >
                <option value="pending">{{ $t('statuses.pending') }}</option>
                <option value="active">{{ $t('statuses.active') }}</option>
                <option value="inactive">{{ $t('statuses.inactive') }}</option>
                <option value="temporarily_closed">{{ $t('statuses.temporarily_closed') }}</option>
                <option value="permanently_closed">{{ $t('statuses.permanently_closed') }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facApproval">{{ $t('facilities.approval') || 'Approval Status' }}</label>
              <select 
                id="facApproval" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" 
                v-model="approval_status"
              >
                <option value="pending">{{ $t('statuses.pending') }}</option>
                <option value="approved">{{ $t('statuses.approved') }}</option>
                <option value="rejected">{{ $t('statuses.rejected') }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facLoc">{{ $t('facilities.location') }} (Latitude, Longitude)</label>
            <input 
              id="facLoc" 
              type="text" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" 
              placeholder="e.g. 31.3478, 34.3012"
              v-model="location"
            />
          </div>

          <div>
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {{ $t('facilities.coverImage') }}
              <span v-if="!facility || !facility.uuid" class="text-rose-500">*</span>
            </h4>
            <ImageUploader v-model="cover_image" :label="$t('facilities.coverImage') || 'Upload Cover Image'" aspect-ratio="aspect-video" />
            <p v-if="coverValidationError" class="text-xs text-rose-600 mt-1">{{ coverValidationError }}</p>
          </div>

          <div>
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              {{ $t('facilities.galleryImages') }}
            </h4>
            <MultipleImageUploader v-model="gallery_images" :label="$t('facilities.galleryImages') || 'Upload Gallery Images'" />
          </div>

          <div>
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              {{ $t('facilities.documents') }}
            </h4>
            <FileUploader v-model="files" :label="$t('facilities.documents') || 'Upload Documents'" />
          </div>
        </div>

        <div v-show="!loadingFac" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
            {{ facility && facility.uuid ? $t('common.save') : $t('facilities.addFacility') }}
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
