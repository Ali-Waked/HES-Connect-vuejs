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
import { getUserSelect } from '../../../services/userService';

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
const latitude = ref('');
const longitude = ref('');
const status = ref('pending');
const approval_status = ref('pending');
const cover_image = ref(null);
const city_id = ref('');
const gallery_images = ref([]);
const files = ref([]);
const loadingFac = ref(false);
const coverValidationError = ref('');

const usersList = ref([]);
const loadingUsers = ref(false);
const owner_id = ref('');
const is_featured = ref(false);

const existingImages = ref([]);
const existingFiles = ref([]);
const deletedImageUuids = ref([]);
const deletedFileUuids = ref([]);

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
        type.value = data.facility_type || data.type || 'medical_point';
        organization_id.value = data.organization_id || '';
        parent_id.value = data.parent_id || '';
        city_id.value = data.city?.uuid || data.city_id || '';
        latitude.value = data.latitude ?? '';
        longitude.value = data.longitude ?? '';
        status.value = data.status || 'pending';
        approval_status.value = data.approval_status || 'pending';
        cover_image.value = data.cover_image || null;
        existingImages.value = data.images || data.gallery_images || [];
        existingFiles.value = data.files || [];
        gallery_images.value = [];
        files.value = [];
        deletedImageUuids.value = [];
        deletedFileUuids.value = [];
        owner_id.value = data.owner_id || data.owner?.uuid || '';
        is_featured.value = data.is_featured ?? false;
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
  latitude.value = '';
  longitude.value = '';
  status.value = 'pending';
  approval_status.value = 'pending';
  cover_image.value = null;
  owner_id.value = '';
  is_featured.value = false;
  coverValidationError.value = '';
  existingImages.value = [];
  existingFiles.value = [];
  deletedImageUuids.value = [];
  deletedFileUuids.value = [];
  gallery_images.value = [];
  files.value = [];
}

function removeExistingImage(index) {
  const item = existingImages.value[index]
  if (item?.uuid && !deletedImageUuids.value.includes(item.uuid)) {
    deletedImageUuids.value.push(item.uuid)
  }
  existingImages.value.splice(index, 1)
}

function removeExistingFile(index) {
  const item = existingFiles.value[index]
  if (item?.uuid && !deletedFileUuids.value.includes(item.uuid)) {
    deletedFileUuids.value.push(item.uuid)
  }
  existingFiles.value.splice(index, 1)
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
    if (usersList.value.length === 0) {
      loadingUsers.value = true;
      try {
        const { data } = await getUserSelect('facility_owner');
        usersList.value = data.data || data || [];
      } catch (e) {
        usersList.value = [];
      } finally {
        loadingUsers.value = false;
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
      latitude: latitude.value,
      longitude: longitude.value,
      status: status.value,
      approval_status: approval_status.value,
      cover_image: cover_image.value,
      gallery_images: gallery_images.value,
      files: files.value,
      owner_id: owner_id.value || null,
      is_featured: is_featured.value,
      deleted_gallery_images: deletedImageUuids.value,
      deleted_files: deletedFileUuids.value,
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
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facOrg">{{ $t('facilities.organization') }}</label>
            <select 
              id="facOrg" 
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" 
              v-model="organization_id"
            >
              <option value="">{{ $t('facilities.noOrganization') || 'No Organization' }}</option>
              <option v-for="org in organizations" :key="org.uuid" :value="org.uuid">
                {{ localField(org, 'name') }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facOwner">{{ $t('facilities.owner') || 'Facility Owner' }} *</label>
            <select
              id="facOwner"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer"
              required
              v-model="owner_id"
            >
              <option value="" disabled>{{ loadingUsers ? 'Loading users...' : (usersList.length === 0 ? 'No users available' : 'Select Facility Owner') }}</option>
              <option v-for="user in usersList" :key="user.uuid || user.id" :value="user.uuid || user.id">
                {{ localField(user, 'name') }} {{ user.email ? `(${user.email})` : '' }}
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
            <div class="flex items-center gap-3 mt-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" v-model="is_featured" />
                <div class="w-9 h-5 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ $t('facilities.is_featured') || 'Featured' }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facLat">{{ $t('facilities.latitude') || 'Latitude' }}</label>
              <input 
                id="facLat" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" 
                placeholder="e.g. 31.3478"
                v-model="latitude"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="facLng">{{ $t('facilities.longitude') || 'Longitude' }}</label>
              <input 
                id="facLng" 
                type="text" 
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" 
                placeholder="e.g. 34.3012"
                v-model="longitude"
              />
            </div>
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
            <div v-if="existingImages.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
              <div
                v-for="(img, index) in existingImages"
                :key="img.uuid || index"
                class="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ring-1 ring-brand-primary/20"
              >
                <img :src="img.url || img.image_url || img" class="w-full h-full object-cover" alt="Existing gallery image" />
                <div class="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-primary/80 text-white text-[9px] font-semibold rounded">{{ $t('common.existing') || 'Existing' }}</div>
                <div class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    class="p-1.5 bg-rose-500/90 rounded-lg text-white hover:bg-rose-600 transition cursor-pointer"
                    @click="removeExistingImage(index)"
                    :title="$t('common.remove') || 'Remove'"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <MultipleImageUploader v-model="gallery_images" :label="$t('facilities.addNew') || 'Add New Images'" />
            <p v-if="deletedImageUuids.length > 0" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {{ deletedImageUuids.length }} {{ $t('facilities.imageRemoved') || 'image(s) marked for removal' }}
            </p>
          </div>

          <div>
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              {{ $t('facilities.documents') }}
            </h4>
            <div v-if="existingFiles.length > 0" class="space-y-2 mb-3">
              <div
                v-for="(file, index) in existingFiles"
                :key="file.uuid || index"
                class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 group ring-1 ring-brand-primary/10"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span class="shrink-0 px-1.5 py-0.5 bg-brand-primary/80 text-white text-[9px] font-semibold rounded">{{ $t('common.existing') || 'Existing' }}</span>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ file.name || file.file_name || 'File' }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  class="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer"
                  @click="removeExistingFile(index)"
                  :title="$t('common.remove') || 'Remove'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
            <FileUploader v-model="files" :label="$t('facilities.addNew') || 'Add New Files'" />
            <p v-if="deletedFileUuids.length > 0" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {{ deletedFileUuids.length }} {{ $t('facilities.fileRemoved') || 'file(s) marked for removal' }}
            </p>
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
