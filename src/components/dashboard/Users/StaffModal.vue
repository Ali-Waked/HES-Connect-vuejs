<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useStaff } from '../../../composables/useStaff';
import { useDashboardStore } from '../../../stores/dashboard';
import { getFacilities } from '../../../services/facilityService';
import { getFacilityRoles } from '../../../services/roleService';
import { getDepartmentsLookup } from '../../../services/departmentService';
import { getPositionsLookup } from '../../../services/positionService';
import { staffApiToForm, staffFormToUpdatePayload } from '../../../utils/staffHelpers';
import ImageUploader from '../global/ImageUploader.vue';
import SymptomMultiSelect from '../Symptoms/SymptomMultiSelect.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  staffMember: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { createStaff, updateStaff, fetchStaffById, checkStaffEmail, saving, checkingEmail } = useStaff();
const store = useDashboardStore();

const isEdit = ref(false);
const facilityRows = ref([]);
const symptomIds = ref([]);
let rowKeyCounter = 0;

const form = reactive({
  name: { en: '', ar: '' },
  email: '',
  avatar: null,
  cover_image: null,
  bio: { en: '', ar: '' },
  specialization: { en: '', ar: '' },
  experience_years: '',
  consultation_fee: '',
  staff_uuid: '',
  mode: 'new_user',
});

const formTouched = reactive({
  name: false,
  email: false,
  avatar: false,
  cover_image: false,
});

function safeSet(key, value) {
  if (!formTouched[key]) {
    form[key] = value;
  }
}

const step = ref('email');
const existingUser = ref(null);
const checkError = ref('');
const loadingStaffData = ref(false);
const submitError = ref('');

const facilities = ref([]);
const rolesList = ref([]);
const positionsList = ref([]);

const availableFacilities = computed(() => {
  const used = new Set(facilityRows.value.map(r => r.facility_uuid))
  return facilities.value.filter(f => !used.has(f.uuid))
})

watch(() => props.show, async (val) => {
  if (val) {
    submitError.value = '';
    if (facilities.value.length === 0) {
      try {
        const { data } = await getFacilities({ per_page: 1000 })
        facilities.value = data.data
      } catch (e) { /* silently fail */ }
    }
    if (rolesList.value.length === 0) {
      try {
        const { data } = await getFacilityRoles()
        console.log(data);
        rolesList.value = data.data || data
      } catch (e) { /* silently fail */ }
    }
    if (positionsList.value.length === 0) {
      try {
        const { data } = await getPositionsLookup()
        positionsList.value = data.data || data
      } catch (e) { /* silently fail */ }
    }
  }
});

watch(
  () => props.staffMember,
  async (newMember) => {
    if (newMember && newMember.uuid) {
      isEdit.value = true;
      step.value = 'form';
      loadingStaffData.value = true;
      submitError.value = '';
      try {
        const data = await fetchStaffById(newMember.uuid);
        const f = staffApiToForm(data);
        form.name = { en: f.name_en, ar: f.name_ar };
        form.email = f.email;
        form.specialization = { en: f.specialization_en, ar: f.specialization_ar };
        form.bio = { en: f.bio_en, ar: f.bio_ar };
        form.experience_years = f.experience_years;
        form.consultation_fee = f.consultation_fee;
        form.avatar = f.avatar || null;
        form.cover_image = f.cover_image || null;
        form.staff_uuid = data.uuid || '';
        symptomIds.value = f.symptoms || [];
        facilityRows.value = f.facilities.map(f => ({ ...f, departmentsOptions: [], loadingDepartments: false, key: ++rowKeyCounter }));
        for (const row of facilityRows.value) {
          if (row.facility_uuid) await onFacilityChange(row);
        }
      } catch (err) {
        store.addToast('Failed to load staff data', 'error');
        emit('close');
      } finally {
        loadingStaffData.value = false;
      }
    } else {
      isEdit.value = false;
      step.value = 'email';
      resetForm();
    }
  },
  { immediate: true }
);

async function onFacilityChange(row) {
  row.department_uuid = '';
  row.departmentsOptions = [];
  if (!row.facility_uuid) return;
  row.loadingDepartments = true;
  try {
    const { data } = await getDepartmentsLookup({ facility_id: row.facility_uuid });
    row.departmentsOptions = data.data || data;
  } catch {
    row.departmentsOptions = [];
  } finally {
    row.loadingDepartments = false;
  }
}

function resetForm() {
  isEdit.value = false;
  form.name = { en: '', ar: '' };
  form.email = '';
  form.avatar = null;
  form.cover_image = null;
  form.bio = { en: '', ar: '' };
  form.specialization = { en: '', ar: '' };
  form.experience_years = '';
  form.consultation_fee = '';
  form.staff_uuid = '';
  form.mode = 'new_user';
  symptomIds.value = [];
  formTouched.name = false;
  formTouched.email = false;
  formTouched.avatar = false;
  formTouched.cover_image = false;
  facilityRows.value = [{ facility_uuid: '', role_uuid: '', department_uuid: '', position_uuid: '', departmentsOptions: [], loadingDepartments: false, key: ++rowKeyCounter }];
  step.value = 'email';
  existingUser.value = null;
  checkError.value = '';
  submitError.value = '';
}

function addFacilityRow() {
  facilityRows.value.push({ facility_uuid: '', role_uuid: '', department_uuid: '', position_uuid: '', departmentsOptions: [], loadingDepartments: false, key: ++rowKeyCounter });
}

function removeFacilityRow(key) {
  if (facilityRows.value.length <= 1) return;
  facilityRows.value = facilityRows.value.filter(r => r.key !== key);
}

function formFacilitiesValue() {
  return facilityRows.value
    .filter(r => r.facility_uuid)
    .map(r => ({ facility_uuid: r.facility_uuid, role_uuid: r.role_uuid, department_uuid: r.department_uuid, position_uuid: r.position_uuid }))
}

async function handleCheckEmail() {
  if (!form.email.trim()) return;
  checkError.value = '';
  existingUser.value = null;

  const result = await checkStaffEmail(form.email.trim());
  if (result.error) {
    checkError.value = result.error;
    return;
  }

  if (!result.exists) {
    form.mode = 'new_user';
    form.staff_uuid = '';
    form.name = { en: '', ar: '' };
    form.avatar = null;
    form.cover_image = null;
    form.bio = { en: '', ar: '' };
    form.specialization = { en: '', ar: '' };
    form.experience_years = '';
    form.consultation_fee = '';
    formTouched.name = false;
    formTouched.email = false;
    formTouched.avatar = false;
    formTouched.cover_image = false;
    facilityRows.value = [{ facility_uuid: '', role_uuid: '', department_uuid: '', position_uuid: '', departmentsOptions: [], loadingDepartments: false, key: ++rowKeyCounter }];
    step.value = 'form';
    return;
  }

  existingUser.value = result.user;

  safeSet('name', result.user?.name || '');
  safeSet('email', result.user?.email || '');
  safeSet('avatar', result.user?.avatar || null);
  safeSet('cover_image', result.user?.cover_image || null);

  if (result.has_staff_profile) {
    form.staff_uuid = result.staff?.uuid || '';
    form.mode = 'existing_staff';
    isEdit.value = true;
    loadingStaffData.value = true;
    step.value = 'form';
    try {
      const data = await fetchStaffById(form.staff_uuid);
      const f = staffApiToForm(data);
      form.name = { en: f.name_en, ar: f.name_ar };
      form.email = f.email;
      form.specialization = { en: f.specialization_en, ar: f.specialization_ar };
      form.bio = { en: f.bio_en, ar: f.bio_ar };
      form.experience_years = f.experience_years;
      form.consultation_fee = f.consultation_fee;
      form.avatar = f.avatar || null;
      form.cover_image = f.cover_image || null;
      form.staff_uuid = data.uuid || '';
      symptomIds.value = f.symptoms || [];
      facilityRows.value = f.facilities.map(f => ({ ...f, departmentsOptions: [], loadingDepartments: false, key: ++rowKeyCounter }));
      for (const row of facilityRows.value) {
        if (row.facility_uuid) await onFacilityChange(row);
      }
    } catch (err) {
      store.addToast('Failed to load staff data', 'error');
      emit('close');
    } finally {
      loadingStaffData.value = false;
    }
  } else {
    form.mode = 'existing_user';
  }

  step.value = 'form';
}

const submitForm = async () => {
  submitError.value = '';

  const invalidRows = facilityRows.value.filter(r => r.facility_uuid && !r.role_uuid);
  if (invalidRows.length > 0) {
    submitError.value = 'Each facility requires a role.';
    return;
  }

  let result;

  const payload = staffFormToUpdatePayload({
    symptoms: symptomIds.value,
    specialization_en: form.specialization.en,
    specialization_ar: form.specialization.ar,
    bio_en: form.bio.en,
    bio_ar: form.bio.ar,
    experience_years: form.experience_years,
    consultation_fee: form.consultation_fee,
    facilities: formFacilitiesValue(),
    avatar: form.avatar,
    cover_image: form.cover_image,
  });

  const staffUuid = props.staffMember?.uuid || form.staff_uuid;
  if (staffUuid) {
    result = await updateStaff(staffUuid, payload);
  } else {
    payload.name = { en: form.name.en, ar: form.name.ar };
    payload.email = form.email;
    if (existingUser.value) {
      payload.user_uuid = existingUser.value.uuid;
    }
    result = await createStaff(payload);
  }

  if (result.success) {
    store.addToast(
      isEdit.value ? 'Staff member updated successfully' : 'Staff member created successfully',
      'success'
    );
    emit('close');
  } else {
    submitError.value = result.error || 'An unexpected error occurred';
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[600px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">

      <!-- Header -->
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <button
            v-if="!isEdit"
            type="button"
            class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            @click="step = 'email'; resetForm()"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
          </button>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ isEdit ? $t('staff.editStaff') : $t('staff.addStaff') }}
          </h3>
        </div>
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
        <div v-if="loadingStaffData" class="flex flex-col items-center justify-center py-12 gap-3">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
        </div>

        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">

          <!-- Email Step -->
          <template v-if="step === 'email'">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffEmail">
                {{ $t('staff.email') }} *
              </label>
              <input
                id="staffEmail"
                type="email"
                class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
                required
                dir="ltr"
                placeholder="e.g. doctor@example.com"
                v-model="form.email"
                @keydown.enter.prevent="handleCheckEmail"
              />
            </div>
            <p v-if="checkError" class="text-xs text-rose-600">{{ checkError }}</p>
            <div class="flex justify-end">
              <button
                type="button"
                :disabled="checkingEmail || !form.email.trim()"
                class="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
                @click="handleCheckEmail"
              >
                <svg v-if="checkingEmail" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                {{ checkingEmail ? $t('staff.checkingEmail') : $t('staff.continue') }}
              </button>
            </div>
          </template>

          <!-- Form (Create or Edit) -->
          <template v-if="step === 'form'">

            <!-- Existing user banner -->
            <div v-if="existingUser && !isEdit" class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm font-bold">{{ $t('staff.existingUserFound') }}</span>
              </div>
              <div class="flex items-center gap-3 pt-1">
                <div class="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-sm font-bold">
                  {{ localField(existingUser, 'name').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{{ localField(existingUser, 'name') }}</p>
                  <p class="text-xs text-emerald-600 dark:text-emerald-400">{{ existingUser.email }}</p>
                </div>
              </div>
            </div>

            <!-- New user banner -->
            <div v-if="!existingUser && !isEdit" class="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm font-bold">{{ $t('staff.noUserFound') }}</span>
              </div>
              <p class="text-xs text-amber-600 dark:text-amber-500 mt-1">{{ $t('staff.newUserCreated') }}</p>
            </div>

            <!-- Name fields (new user only) -->
            <template v-if="!isEdit">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffNameEn">{{ $t('staff.name_en') }} *</label>
                  <input id="staffNameEn" type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" required dir="ltr" v-model="form.name.en" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffNameAr">{{ $t('staff.name_ar') }} *</label>
                  <input id="staffNameAr" type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right" required dir="rtl" v-model="form.name.ar" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffNewEmail">{{ $t('staff.email') }} *</label>
                <input id="staffNewEmail" type="email" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" required dir="ltr" v-model="form.email" readonly />
              </div>
            </template>

            <!-- Name fields (edit - readonly email) -->
            <template v-if="isEdit">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="editStaffNameEn">{{ $t('staff.name_en') }} *</label>
                  <input id="editStaffNameEn" type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" required dir="ltr" v-model="form.name.en" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="editStaffNameAr">{{ $t('staff.name_ar') }} *</label>
                  <input id="editStaffNameAr" type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right" required dir="rtl" v-model="form.name.ar" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="editStaffEmail">{{ $t('staff.email') }} *</label>
                <input id="editStaffEmail" type="email" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none transition cursor-not-allowed" required dir="ltr" v-model="form.email" readonly />
              </div>
            </template>

            <!-- User Information section -->
            <div class="border-t border-slate-100 dark:border-slate-800 pt-2">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{{ $t('staff.userInformation') || 'User Information' }}</p>
            </div>

            <!-- Avatar & Cover -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploader v-model="form.avatar" label="Avatar" aspect-ratio="aspect-square" />
              <ImageUploader v-model="form.cover_image" label="Cover Image" aspect-ratio="aspect-video" />
            </div>

            <!-- Bio -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffBioEn">{{ $t('staff.bio') }} (English)</label>
                <textarea id="staffBioEn" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition" dir="ltr" v-model="form.bio.en"></textarea>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffBioAr">{{ $t('staff.bio') }} (Arabic)</label>
                <textarea id="staffBioAr" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none min-h-[80px] resize-none transition text-right" dir="rtl" v-model="form.bio.ar"></textarea>
              </div>
            </div>

            <!-- Specialization -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffSpecEn">{{ $t('staff.specialization_en') }}</label>
                <input id="staffSpecEn" type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" dir="ltr" v-model="form.specialization.en" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffSpecAr">{{ $t('staff.specialization_ar') }}</label>
                <input id="staffSpecAr" type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right" dir="rtl" v-model="form.specialization.ar" />
              </div>
            </div>

            <!-- Experience & Fee -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffExp">{{ $t('staff.yearsOfExperience') }}</label>
                <input id="staffExp" type="number" min="0" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" v-model="form.experience_years" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="staffFee">{{ $t('staff.consultationFee') }}</label>
                <input id="staffFee" type="number" min="0" step="0.01" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition" v-model="form.consultation_fee" />
              </div>
            </div>

            <!-- Assignment Information section -->
            <div class="border-t border-slate-100 dark:border-slate-800 pt-2">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{{ $t('staff.assignmentInformation') || 'Assignment Information' }}</p>
            </div>

            <!-- Facilities & Roles (dynamic rows) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('staff.facility') }}</p>
                <button type="button" class="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition cursor-pointer" @click="addFacilityRow">+ {{ $t('staff.addFacility') || 'Add Facility' }}</button>
              </div>
              <div class="space-y-3">
                <div v-for="(row, idx) in facilityRows" :key="row.key" class="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Facility *</label>
                      <select class="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" v-model="row.facility_uuid" @change="onFacilityChange(row)">
                        <option value="">Select Facility</option>
                        <option v-for="fac in facilities" :key="fac.uuid" :value="fac.uuid" :disabled="facilityRows.some(r => r.facility_uuid === fac.uuid && r.key !== row.key)">{{ localField(fac, 'name') }}</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{{ $t('staff.role') }} *</label>
                      <select class="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" v-model="row.role_uuid">
                        <option value="">Select Role</option>
                        <option v-for="role in rolesList" :key="role.uuid" :value="role.uuid">{{ localField(role, 'name') }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start mt-3">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{{ $t('staff.position') }}</label>
                      <select class="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer" v-model="row.position_uuid">
                        <option value="">Select Position</option>
                        <option v-for="pos in positionsList" :key="pos.uuid" :value="pos.uuid">{{ localField(pos, 'name') }}</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <div class="flex items-center gap-1.5">
                        <label class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Department</label>
                        <button v-if="facilityRows.length > 1" type="button" class="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer ml-auto" title="Remove" @click="removeFacilityRow(row.key)">
                          <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div class="flex gap-2">
                        <div class="flex-1 relative">
                          <select
                            class="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            v-model="row.department_uuid"
                            :disabled="!row.facility_uuid || row.loadingDepartments"
                          >
                            <option value="">
                              {{ !row.facility_uuid ? 'Select Facility first' : row.loadingDepartments ? 'Loading...' : row.departmentsOptions.length === 0 ? 'No departments available' : 'Select Department' }}
                            </option>
                            <option v-for="dept in row.departmentsOptions" :key="dept.uuid" :value="dept.uuid">{{ localField(dept, 'name') }}</option>
                          </select>
                          <svg v-if="row.loadingDepartments" class="w-4 h-4 text-brand-primary animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </template>

                  <!-- Symptoms Section -->
            <div class="border-t border-slate-100 dark:border-slate-800 pt-2">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{{ $t('staff.symptoms') || 'Symptoms' }}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('staff.symptoms') || 'Symptoms' }}</label>
              <SymptomMultiSelect v-model="symptomIds" :placeholder="$t('staff.selectSymptoms') || 'Select symptoms...'" facility-only />
            </div>

            <!-- Submit Error -->
          <p v-if="submitError" class="text-xs text-rose-600 text-center">{{ submitError }}</p>
        </div>

        <!-- Footer -->
        <div v-show="!loadingStaffData && step !== 'email'" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
            class="inline-flex items-center justify-center gap-1.5 py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            <svg v-if="saving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            {{ isEdit ? $t('common.save') : $t('staff.addStaff') }}
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
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
