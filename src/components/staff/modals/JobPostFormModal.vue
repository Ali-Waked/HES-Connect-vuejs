<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFacilityJobs } from '@/composables/useFacilityJobs'
import StaffModalShell from './StaffModalShell.vue'
import TipTapEditor from '@/components/dashboard/global/TipTapEditor.vue'
import CategorySelect from '@/components/shared/CategorySelect.vue'

const props = defineProps({ show: Boolean, post: Object })
const emit = defineEmits(['close'])
const { t } = useI18n()
const { localField } = useLocaleField()
const { createJobPost, updateJobPost, saving } = useFacilityJobs()

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship']
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive']
const CURRENCIES = ['USD', 'EUR', 'SAR', 'AED', 'EGP', 'JOD', 'GBP', 'TRY', 'QAR', 'KWD', 'ILS']

const formData = ref({
  title_en: '',
  title_ar: '',
  content_en: '',
  content_ar: '',
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
})

const contentTab = ref('en')
const errors = ref({})
const cover_image = ref(null)
const cover_image_preview = ref('')

function resetForm() {
  return {
    title_en: '',
    title_ar: '',
    content_en: '',
    content_ar: '',
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
  }
}

function populateForm(post) {
  return {
    title_en: (typeof post.title === 'object' ? post.title?.en : post.title) || post.title_en || '',
    title_ar: (typeof post.title === 'object' ? post.title?.ar : '') || post.title_ar || '',
    content_en: (typeof post.content === 'object' ? post.content?.en : post.content) || post.description_en || post.content_en || '',
    content_ar: (typeof post.content === 'object' ? post.content?.ar : '') || post.description_ar || post.content_ar || '',
    category_id: post.category_id || '',
    employment_type: post.employment_type || '',
    experience_level: post.experience_level || '',
    location: post.location || '',
    salary_from: post.salary_from ?? null,
    salary_to: post.salary_to ?? null,
    salary_currency: post.salary_currency || 'USD',
    is_salary_visible: Number(post.is_salary_visible ?? 1),
    vacancies: post.vacancies ?? null,
    status: post.status || 'pending',
    end_date: post.end_date || '',
    apply_method: post.apply_method || 'email',
    apply_value: post.apply_value || ''
  }
}

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    errors.value = {}
    contentTab.value = 'en'
    cover_image.value = null
    cover_image_preview.value = props.post?.cover_image || ''
    formData.value = props.post ? populateForm(props.post) : resetForm()
  }
})

function onCoverImageChange(e) {
  const file = e.target.files[0]
  if (file) {
    cover_image.value = file
    cover_image_preview.value = URL.createObjectURL(file)
  }
}

function removeCoverImage() {
  cover_image.value = null
  cover_image_preview.value = ''
}

async function submit() {
  errors.value = {}
  if (!formData.value.title_en.trim()) { errors.value.title_en = t('validation.required') || 'Required'; return }
  if (!formData.value.title_ar.trim()) { errors.value.title_ar = t('validation.required') || 'Required'; return }
  if (!formData.value.category_id) { errors.value.category_id = t('validation.required') || 'Required'; return }
  if (!formData.value.employment_type) { errors.value.employment_type = t('validation.required') || 'Required'; return }
  if (!formData.value.experience_level) { errors.value.experience_level = t('validation.required') || 'Required'; return }

  const payload = {
    title: { en: formData.value.title_en, ar: formData.value.title_ar },
    content: { en: formData.value.content_en, ar: formData.value.content_ar },
    category_id: formData.value.category_id,
    employment_type: formData.value.employment_type,
    experience_level: formData.value.experience_level,
    location: formData.value.location || '',
    salary_from: formData.value.salary_from,
    salary_to: formData.value.salary_to,
    salary_currency: formData.value.salary_currency || 'USD',
    is_salary_visible: formData.value.is_salary_visible ? 1 : 0,
    vacancies: formData.value.vacancies,
    status: formData.value.status,
    end_date: formData.value.end_date,
    apply_method: formData.value.apply_method,
    apply_value: formData.value.apply_value,
  }
  if (cover_image.value) {
    payload.cover_image = cover_image.value
  }

  let result
  if (props.post) {
    result = await updateJobPost(props.post.id, payload)
  } else {
    result = await createJobPost(payload)
  }

  if (result?.success) {
    emit('close')
  }
}
</script>

<template>
  <StaffModalShell :show="show" :title="post ? $t('jobs.editJob') : $t('jobs.postJob')" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-5">

      <div>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ $t('jobs.details') }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.title_en') }}</label>
            <input v-model="formData.title_en" type="text" required dir="ltr" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" :placeholder="$t('jobs.title_en')"/>
            <p v-if="errors.title_en" class="text-xs text-red-500 mt-1">{{ errors.title_en }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right block">{{ $t('jobs.title_ar') }}</label>
            <input v-model="formData.title_ar" type="text" required dir="rtl" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition text-right" :placeholder="$t('jobs.title_ar')"/>
            <p v-if="errors.title_ar" class="text-xs text-red-500 mt-1 text-right">{{ errors.title_ar }}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          {{ $t('jobs.jobContent') }}
        </h4>
        <div class="flex gap-1 mb-3">
          <button type="button" @click="contentTab = 'en'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer" :class="contentTab === 'en' ? 'bg-brand-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">English</button>
          <button type="button" @click="contentTab = 'ar'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer" :class="contentTab === 'ar' ? 'bg-brand-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">العربية</button>
        </div>
        <div v-show="contentTab === 'en'">
          <TipTapEditor v-model="formData.content_en" :placeholder="$t('jobs.contentPlaceholderEn') || 'Write job description in English...'" dir="ltr" />
        </div>
        <div v-show="contentTab === 'ar'">
          <TipTapEditor v-model="formData.content_ar" :placeholder="$t('jobs.contentPlaceholderAr') || 'اكتب وصف الوظيفة باللغة العربية...'" dir="rtl" />
        </div>
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          {{ $t('jobs.jobDetails') || 'Job Details' }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.category') }}</label>
            <CategorySelect v-model="formData.category_id" type="job" :placeholder="$t('jobs.selectCategory')" />
            <p v-if="errors.category_id" class="text-xs text-red-500 mt-1">{{ errors.category_id }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.employmentType') }}</label>
            <select v-model="formData.employment_type" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
              <option value="" disabled>{{ $t('common.select') || 'Select...' }}</option>
              <option v-for="et in EMPLOYMENT_TYPES" :key="et" :value="et">{{ t(`employmentTypes.${et}`) || et.replace(/_/g, ' ') }}</option>
            </select>
            <p v-if="errors.employment_type" class="text-xs text-red-500 mt-1">{{ errors.employment_type }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.experienceLevel') }}</label>
            <select v-model="formData.experience_level" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
              <option value="" disabled>{{ $t('common.select') || 'Select...' }}</option>
              <option v-for="el in EXPERIENCE_LEVELS" :key="el" :value="el">{{ t(`experienceLevels.${el}`) || el.replace(/_/g, ' ') }}</option>
            </select>
            <p v-if="errors.experience_level" class="text-xs text-red-500 mt-1">{{ errors.experience_level }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.location') }}</label>
            <input v-model="formData.location" type="text" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" :placeholder="$t('jobs.locationPlaceholder')"/>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.vacancies') }}</label>
            <input v-model="formData.vacancies" type="number" min="1" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" placeholder="1"/>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ $t('jobs.salary') || 'Salary' }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryFrom') }}</label>
            <input v-model="formData.salary_from" type="number" min="0" step="0.01" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"/>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryTo') }}</label>
            <input v-model="formData.salary_to" type="number" min="0" step="0.01" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"/>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryCurrency') }}</label>
            <select v-model="formData.salary_currency" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
              <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="space-y-1.5 flex items-end pb-2.5">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="formData.is_salary_visible" class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-primary focus:ring-brand-primary/40 cursor-pointer" />
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salaryVisible') }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.coverImage') }}</label>
        <div v-if="cover_image_preview" class="relative group">
          <img :src="cover_image_preview" class="w-full h-44 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
          <button type="button" @click="removeCoverImage" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <label v-else class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary transition">
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('jobs.clickToUpload') || 'Click to upload cover image' }}</p>
          </div>
          <input type="file" class="hidden" accept="image/*" @change="onCoverImageChange" />
        </label>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.applyMethod') }}</label>
          <select v-model="formData.apply_method" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
            <option value="email">{{ $t('jobs.applyByEmail') }}</option>
            <option value="link">{{ $t('jobs.applyByLink') }}</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.applyDetail') || 'Apply Detail' }}</label>
          <input v-model="formData.apply_value" type="text" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" :placeholder="formData.apply_method === 'email' ? 'hr@example.com' : 'https://...'"/>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.endDate') }}</label>
          <input v-model="formData.end_date" type="date" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"/>
        </div>
      </div>

      <div class="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
        <button type="button" @click="$emit('close')" class="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer">{{ $t('common.cancel') }}</button>
        <button type="submit" :disabled="saving" class="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-primary/20 transition cursor-pointer">
          <svg v-if="saving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          {{ post ? $t('common.save') : $t('jobs.postJob') }}
        </button>
      </div>
    </form>
  </StaffModalShell>
</template>
