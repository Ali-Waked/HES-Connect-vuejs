<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useJobs } from '../../../composables/useJobs';
import { getFacilities } from '../../../services/facilityService';
import TipTapEditor from '../global/TipTapEditor.vue';
import CategorySelect from '../../shared/CategorySelect.vue';

const props = defineProps({
  show: Boolean,
  job: Object,
  mode: { type: String, default: 'add' }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const { localField } = useLocaleField();
const { createJob, updateJob, saving } = useJobs();

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
const CURRENCIES = ['USD', 'EUR', 'SAR', 'AED', 'EGP', 'JOD', 'GBP', 'TRY', 'QAR', 'KWD', 'ILS'];

const formData = ref({
  facility_id: '',
  title: { en: '', ar: '' },
  content: { en: '', ar: '' },
  category_id: '',
  employment_type: '',
  experience_level: '',
  location: '',
  salary_from: null,
  salary_to: null,
  salary_currency: 'USD',
  is_salary_visible: true,
  vacancies: null,
  status: 'pending',
  end_date: '',
  apply_method: 'email',
  apply_value: ''
});

const contentTab = ref('en');
const facilities = ref([]);
const errors = ref({});
const cover_image = ref(null);
const cover_image_preview = ref('');

async function loadFacilities() {
  try {
    const { data } = await getFacilities({ per_page: 1000 });
    facilities.value = data.data || data;
  } catch {
    // silently fail
  }
}

function resetForm() {
  return {
    facility_id: facilities.value[0]?.id || '',
    title: { en: '', ar: '' },
    content: { en: '', ar: '' },
    category_id: '',
    employment_type: '',
    experience_level: '',
    location: '',
    salary_from: null,
    salary_to: null,
    salary_currency: 'USD',
    is_salary_visible: true,
    vacancies: null,
    status: 'pending',
    end_date: '',
    apply_method: 'email',
    apply_value: ''
  };
}

function populateForm(job) {
  return {
    facility_id: job.facility_id || '',
    title: {
      en: job.title?.en || job.title_en || '',
      ar: job.title?.ar || job.title_ar || ''
    },
    content: {
      en: job.content?.en || job.content_en || job.description_en || '',
      ar: job.content?.ar || job.content_ar || job.description_ar || ''
    },
    category_id: job.category_id || '',
    employment_type: job.employment_type || '',
    experience_level: job.experience_level || '',
    location: job.location || '',
    salary_from: job.salary_from ?? null,
    salary_to: job.salary_to ?? null,
    salary_currency: job.salary_currency || 'USD',
    is_salary_visible: job.is_salary_visible ?? true,
    vacancies: job.vacancies ?? null,
    status: job.status || 'pending',
    end_date: job.end_date || '',
    apply_method: job.apply_method || 'email',
    apply_value: job.apply_value || ''
  };
}

watch(() => props.show, async (isShowing) => {
  if (isShowing) {
    if (facilities.value.length === 0) await loadFacilities();
    errors.value = {};
    contentTab.value = 'en';
    cover_image.value = null;
    cover_image_preview.value = props.job?.cover_image || '';
    formData.value = props.mode === 'edit' && props.job
      ? populateForm(props.job)
      : resetForm();
  }
});

function onCoverImageChange(e) {
  const file = e.target.files[0];
  if (file) {
    cover_image.value = file;
    cover_image_preview.value = URL.createObjectURL(file);
  }
}

function removeCoverImage() {
  cover_image.value = null;
  cover_image_preview.value = '';
}

async function handleSubmit() {
  errors.value = {};
  if (!formData.value.title.en.trim()) {
    errors.value.title_en = t('validation.required') || 'Required';
    return;
  }
  if (!formData.value.title.ar.trim()) {
    errors.value.title_ar = t('validation.required') || 'Required';
    return;
  }
  if (!formData.value.category_id) {
    errors.value.category_id = t('validation.required') || 'Required';
    return;
  }
  if (!formData.value.employment_type) {
    errors.value.employment_type = t('validation.required') || 'Required';
    return;
  }
  if (!formData.value.experience_level) {
    errors.value.experience_level = t('validation.required') || 'Required';
    return;
  }

  const payload = {
    facility_id: formData.value.facility_id,
    title: formData.value.title,
    content: formData.value.content,
    category_id: formData.value.category_id,
    employment_type: formData.value.employment_type,
    experience_level: formData.value.experience_level,
    location: formData.value.location || '',
    salary_from: formData.value.salary_from,
    salary_to: formData.value.salary_to,
    salary_currency: formData.value.salary_currency || 'USD',
    is_salary_visible: formData.value.is_salary_visible,
    vacancies: formData.value.vacancies,
    status: formData.value.status,
    end_date: formData.value.end_date,
    apply_method: formData.value.apply_method,
    apply_value: formData.value.apply_value,
  };
  if (cover_image.value) {
    payload.cover_image = cover_image.value;
  }
  let result;

  if (props.mode === 'edit' && props.job) {
    result = await updateJob(props.job.id, payload);
  } else {
    result = await createJob(payload);
  }

  if (result?.success) {
    emit('close');
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ mode === 'edit' ? $t('jobs.editJob') : $t('jobs.postJob') }}
        </h3>
        <button @click="$emit('close')" class="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

        <div>
          <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Basic Information
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.title_en') }}</label>
              <input v-model="formData.title.en" type="text" required dir="ltr" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" :placeholder="$t('jobs.title_en')"/>
              <p v-if="errors.title_en" class="text-xs text-red-500 mt-1">{{ errors.title_en }}</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right block">{{ $t('jobs.title_ar') }}</label>
              <input v-model="formData.title.ar" type="text" required dir="rtl" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition text-right" :placeholder="$t('jobs.title_ar')"/>
              <p v-if="errors.title_ar" class="text-xs text-red-500 mt-1 text-right">{{ errors.title_ar }}</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('facilities.title') }}</label>
              <select v-model="formData.facility_id" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
                <option v-for="f in facilities" :key="f.id" :value="f.id">{{ localField(f, 'name') }}</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.category') || 'Category' }}</label>
              <CategorySelect v-model="formData.category_id" type="job" :placeholder="$t('jobs.selectCategory') || 'Select a category'" />
              <p v-if="errors.category_id" class="text-xs text-red-500 mt-1">{{ errors.category_id }}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Job Details
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.employmentType') || 'Employment Type' }}</label>
              <select v-model="formData.employment_type" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
                <option value="" disabled>{{ $t('common.select') || 'Select...' }}</option>
                <option v-for="et in EMPLOYMENT_TYPES" :key="et" :value="et">{{ et.replace(/_/g, ' ') }}</option>
              </select>
              <p v-if="errors.employment_type" class="text-xs text-red-500 mt-1">{{ errors.employment_type }}</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.experienceLevel') || 'Experience Level' }}</label>
              <select v-model="formData.experience_level" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
                <option value="" disabled>{{ $t('common.select') || 'Select...' }}</option>
                <option v-for="el in EXPERIENCE_LEVELS" :key="el" :value="el">{{ el.replace(/_/g, ' ') }}</option>
              </select>
              <p v-if="errors.experience_level" class="text-xs text-red-500 mt-1">{{ errors.experience_level }}</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.location') || 'Location' }}</label>
              <input v-model="formData.location" type="text" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" :placeholder="$t('jobs.locationPlaceholder') || 'e.g. Gaza City'"/>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.vacancies') || 'Vacancies' }}</label>
              <input v-model="formData.vacancies" type="number" min="1" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" placeholder="1"/>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Salary
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryFrom') || 'Salary From' }}</label>
              <input v-model="formData.salary_from" type="number" min="0" step="0.01" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition"/>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryTo') || 'Salary To' }}</label>
              <input v-model="formData.salary_to" type="number" min="0" step="0.01" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition"/>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryCurrency') || 'Currency' }}</label>
              <select v-model="formData.salary_currency" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
                <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <div class="space-y-1.5 flex items-end pb-2.5">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="formData.is_salary_visible" class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-primary focus:ring-brand-primary/40 cursor-pointer" />
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryVisible') || 'Show Salary' }}</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            {{ $t('jobs.jobContent') }}
          </h4>
          <div class="flex gap-1 mb-3">
            <button type="button" @click="contentTab = 'en'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer" :class="contentTab === 'en' ? 'bg-brand-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">English</button>
            <button type="button" @click="contentTab = 'ar'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer" :class="contentTab === 'ar' ? 'bg-brand-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">العربية</button>
          </div>
          <div v-show="contentTab === 'en'">
            <TipTapEditor v-model="formData.content.en" placeholder="Write job description in English..." dir="ltr" />
          </div>
          <div v-show="contentTab === 'ar'">
            <TipTapEditor v-model="formData.content.ar" placeholder="اكتب وصف الوظيفة باللغة العربية..." dir="rtl" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.coverImage') || 'Cover Image' }}</label>
          <div v-if="cover_image_preview" class="relative group">
            <img :src="cover_image_preview" class="w-full h-44 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
            <button type="button" @click="removeCoverImage" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <label v-else class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary transition">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg class="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <p class="text-xs text-slate-500">{{ $t('articles.clickToUpload') || 'Click to upload cover image' }}</p>
            </div>
            <input type="file" class="hidden" accept="image/*" @change="onCoverImageChange" />
          </label>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.applyMethod') }}</label>
            <select v-model="formData.apply_method" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
              <option value="email">Email Address</option>
              <option value="link">External Link</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Apply Detail</label>
            <input v-model="formData.apply_value" type="text" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" :placeholder="formData.apply_method === 'email' ? 'hr@example.com' : 'https://...'"/>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.status') }}</label>
            <select v-model="formData.status" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
              <option value="pending">{{ $t('statuses.pending') }}</option>
              <option value="approved">{{ $t('statuses.approved') }}</option>
              <option value="rejected">{{ $t('statuses.rejected') }}</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.endDate') }}</label>
            <input v-model="formData.end_date" type="date" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition"/>
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer">{{ $t('common.cancel') }}</button>
          <button type="submit" :disabled="saving" class="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-primary/20 transition cursor-pointer">
            <svg v-if="saving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {{ mode === 'edit' ? $t('common.save') : $t('jobs.postJob') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-in { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
