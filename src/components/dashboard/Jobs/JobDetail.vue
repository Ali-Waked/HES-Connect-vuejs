<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useDashboardStore } from '@/stores/dashboard';
import { getJob, approveJob, rejectJob } from '../../../services/dashboard/jobService';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const store = useDashboardStore();

const job = ref(null);
const loading = ref(true);
const error = ref(null);
const showImagePreview = ref(false);

const jobId = computed(() => route.params.id);

watch(jobId, fetchJob, { immediate: true });

async function fetchJob() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await getJob(jobId.value);
    job.value = data.data || data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load job post';
  } finally {
    loading.value = false;
  }
}

const goBack = () => router.push('/platform/jobs');

const statusBadgeClass = (status) => {
  const map = {
    approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    pending: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    rejected: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    expired: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };
  return map[status] || map.pending;
};

async function handleApprove() {
  if (!job.value) return;
  try {
    await approveJob(job.value.uuid || job.value.id);
    store.addToast(t('jobs.updated') || 'Job approved', 'success');
    await fetchJob();
  } catch {
    // silently fail
  }
}

async function handleReject() {
  if (!job.value) return;
  try {
    await rejectJob(job.value.uuid || job.value.id);
    store.addToast(t('jobs.updated') || 'Job rejected', 'success');
    await fetchJob();
  } catch {
    // silently fail
  }
}
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 space-y-4">
    <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    <p class="font-medium">{{ $t('common.loading') }}</p>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center py-24 text-center gap-4">
    <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
    </div>
    <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ error }}</p>
    <button @click="goBack" class="py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">{{ $t('common.goBack') }}</button>
  </div>

  <div v-else-if="job" class="max-w-5xl mx-auto space-y-6 animate-fade-in">
    <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
      <button @click="goBack" class="hover:text-brand-primary transition cursor-pointer">{{ $t('jobs.management') }}</button>
      <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-slate-900 dark:text-white truncate max-w-[250px]">{{ localField(job, 'title') }}</span>
    </nav>

    <div class="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div v-if="job.cover_image" class="relative h-64 sm:h-80 w-full">
        <img :src="job.cover_image" :alt="localField(job, 'title')" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
              {{ job.facility ? localField(job.facility, 'name') : job.facility_name }}
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize" :class="statusBadgeClass(job.status)">
              {{ $t(`statuses.${job.status}`) }}
            </span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            {{ localField(job, 'title') }}
          </h1>
        </div>
      </div>

      <div v-else class="bg-gradient-to-br from-brand-primary to-brand-primary-dark p-8">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
            {{ job.facility ? localField(job.facility, 'name') : job.facility_name }}
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize text-white" :class="statusBadgeClass(job.status)">
            {{ $t(`statuses.${job.status}`) }}
          </span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
          {{ localField(job, 'title') }}
        </h1>
      </div>

      <div class="p-8 space-y-8">
        <div class="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504-1.125 1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" /></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{{ $t('jobs.employmentType') }}</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white capitalize">{{ (job.employment_type || '').replace(/_/g, ' ') }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{{ $t('jobs.experienceLevel') }}</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white capitalize">{{ (job.experience_level || '').replace(/_/g, ' ') }}</span>
            </div>
          </div>
          <div v-if="job.location" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{{ $t('jobs.location') }}</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ job.location }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{{ $t('jobs.endDate') }}</span>
              <span class="text-sm font-bold text-rose-600 dark:text-rose-400">{{ formatDate(job.end_date) }}</span>
            </div>
          </div>
          <div v-if="job.vacancies" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{{ $t('jobs.vacancies') }}</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ job.vacancies }}</span>
            </div>
          </div>
        </div>

        <div v-if="job.salary_from || job.salary_to" class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.salary') || 'Salary' }}</span>
          </div>
          <p class="text-xl font-black text-slate-900 dark:text-white">
            {{ job.salary_from ? `${job.salary_from} ${job.salary_currency || ''}` : '' }}
            <span v-if="job.salary_to" class="text-slate-400 dark:text-slate-500 font-normal"> — {{ job.salary_to }} {{ job.salary_currency || '' }}</span>
          </p>
          <p v-if="!job.is_salary_visible" class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ $t('jobs.salaryHidden') || 'Salary is hidden' }}</p>
        </div>

        <div class="max-w-none">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            {{ $t('jobs.jobContent') }}
          </h3>
          <div class="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base" v-html="localField(job, 'content')"></div>
        </div>

        <div v-if="job.category" class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {{ localField(job.category, 'name') || job.category }}
          </span>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            {{ $t('jobs.howToApply') }}
          </h3>
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ $t('jobs.applyVia') }}:</span>
            <a
              v-if="job.apply_method === 'link'"
              :href="job.apply_value"
              target="_blank"
              class="text-sm font-bold text-brand-primary hover:underline"
            >
              {{ job.apply_value }}
            </a>
            <span v-else class="text-sm font-bold text-slate-900 dark:text-white">{{ job.apply_value }}</span>
          </div>
        </div>
      </div>

      <div class="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
        <button
          v-if="job.status === 'pending'"
          @click="handleApprove"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
          {{ $t('jobs.approve') || 'Approve' }}
        </button>
        <button
          v-if="job.status === 'pending'"
          @click="handleReject"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-red-600/20 transition cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          {{ $t('jobs.reject') || 'Reject' }}
        </button>
        <button
          @click="goBack"
          class="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold rounded-lg transition cursor-pointer"
        >
          {{ $t('common.back') }}
        </button>
      </div>
    </div>

    <div v-if="showImagePreview" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showImagePreview = false">
      <img :src="job.cover_image" :alt="localField(job, 'title')" class="max-w-full max-h-[90vh] rounded-xl object-contain" />
      <button @click="showImagePreview = false" class="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition cursor-pointer">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
