<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '@/stores/dashboard';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useJobs } from '../../../composables/useJobs';
import { approveJob, rejectJob } from '../../../services/dashboard/jobService';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const store = useDashboardStore();
const { formatDate } = useFormatDate();
const { jobs, loading, stats, statsLoading, deleteJob, pagination, fetchJobs, fetchJobStats } = useJobs();

const searchQuery = ref('');
const statusFilter = ref('all');
const pageNumber = ref(1);
const rowsPerPage = ref(10);

const showDeleteModal = ref(false);
const showStatusModal = ref(false);
const selectedJob = ref(null);
const statusTargetJob = ref(null);
const statusNewValue = ref('');

function parseParams(query) {
  return {
    search: query.search || '',
    status: query.status && query.status !== 'all' ? query.status : '',
    page: parseInt(query.page) || 1,
    per_page: parseInt(query.per_page) || 10,
  }
}

watch(
  () => route.query,
  (query) => {
    const params = parseParams(query)
    searchQuery.value = params.search
    statusFilter.value = params.status || 'all'
    pageNumber.value = params.page
    rowsPerPage.value = params.per_page
    fetchJobs(params)
  },
  { immediate: true }
)

fetchJobStats()

function pushQuery(updates) {
  const query = { ...route.query }
  for (const [key, val] of Object.entries(updates)) {
    if (val === '' || val === undefined || val === null || val === 'all') {
      delete query[key]
    } else {
      query[key] = String(val)
    }
  }
  router.push({ query })
}

let searchTimeout

function onSearchInput(val) {
  searchQuery.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pushQuery({ search: val, page: undefined })
  }, 400)
}

function onStatusChange(val) {
  statusFilter.value = val
  pushQuery({ status: val, page: undefined })
}

function onPageChange(page) {
  clearTimeout(searchTimeout)
  pushQuery({ page: page > 1 ? page : undefined })
}

function onPerPageChange(val) {
  rowsPerPage.value = parseInt(val)
  pushQuery({ per_page: val, page: undefined })
}

function resetFilters() {
  clearTimeout(searchTimeout)
  pushQuery({ search: undefined, status: undefined, page: undefined })
}

const coverColors = [
  'from-indigo-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-purple-400 to-pink-600',
];
const coverColor = (id) => coverColors[((id || 1) - 1) % coverColors.length];

const statusBadgeClass = (status) => {
  const map = {
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[status] || map.pending;
};

const statusOptions = ['pending', 'approved', 'rejected', 'expired'];

function openView(job) { router.push(`/platform/jobs/${job.id}`); }
function confirmDel(job) { selectedJob.value = job; showDeleteModal.value = true; }

async function handleDelete() {
  if (selectedJob.value) {
    await deleteJob(selectedJob.value.id);
    showDeleteModal.value = false;
    selectedJob.value = null;
  }
}

function openStatusModal(job) {
  statusTargetJob.value = job;
  statusNewValue.value = job.status;
  showStatusModal.value = true;
}

async function confirmStatusChange() {
  const job = statusTargetJob.value;
  if (!job || statusNewValue.value === job.status) {
    showStatusModal.value = false;
    return;
  }
  try {
    if (statusNewValue.value === 'approved') {
      await approveJob(job.uuid || job.id);
    } else if (statusNewValue.value === 'rejected') {
      await rejectJob(job.uuid || job.id);
    }
    store.addToast(t('jobs.updated') || 'Job status updated', 'success');
    const params = parseParams(route.query);
    await Promise.all([fetchJobs(params), fetchJobStats()]);
  } catch (e) {
    // silently fail
  }
  showStatusModal.value = false;
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('jobs.management') }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ pagination.total || 0 }} {{ $t('jobs.openings') }} {{ $t('jobs.listed') }}</p>
    </div>

    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" /></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.total') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.total }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.pending') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.pending }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.approved') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.approved }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.expiringSoon') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.expiring || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Loading Skeleton -->
    <div v-else-if="statsLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 animate-pulse">
        <div class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div class="relative flex-grow min-w-[200px]">
        <svg class="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4.5 h-4.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          class="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
          :placeholder="$t('jobs.searchPlaceholder')"
          :value="searchQuery"
          @input="onSearchInput($event.target.value)"
        />
      </div>
      <select
        class="min-w-[150px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="statusFilter" @change="onStatusChange($event.target.value)"
      >
        <option value="all">{{ $t('jobs.allStatus') }}</option>
        <option value="pending">{{ $t('statuses.pending') }}</option>
        <option value="approved">{{ $t('statuses.approved') }}</option>
        <option value="rejected">{{ $t('statuses.rejected') }}</option>
        <option value="expired">{{ $t('statuses.expired') }}</option>
      </select>
      <select
        class="min-w-[100px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="rowsPerPage" @change="onPerPageChange($event.target.value)"
      >
        <option value="10">10 / page</option>
        <option value="15">15 / page</option>
        <option value="25">25 / page</option>
        <option value="50">50 / page</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
      <svg class="w-8 h-8 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Table Card -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div v-if="jobs?.length === 0" class="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ $t('jobs.noResults') }}</p>
        <button class="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer" @click="resetFilters">{{ $t('common.resetFilters') }}</button>
      </div>

      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left rtl:text-right">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.details') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.facility') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.status') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.dates') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right rtl:text-left">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="job in jobs" :key="job.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4 min-w-[320px]">
                  <div class="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img v-if="job.cover_image" :src="job.cover_image" :alt="localField(job, 'title')" class="w-full h-full object-cover" />
                    <div v-else :class="`w-full h-full bg-gradient-to-br ${coverColor(job.id)} flex items-center justify-center shadow-sm text-white`">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504-1.125 1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504-1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" />
                      </svg>
                    </div>
                  </div>
                  <div class="min-w-0">
                    <button
                      class="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-primary transition cursor-pointer text-left rtl:text-right leading-snug truncate block w-full"
                      @click="openView(job)"
                    >
                      {{ localField(job, 'title') }}
                    </button>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                      {{ localField(job, 'description') }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                {{ job.facility ? localField(job.facility, 'name') : (job.facility_name || '—') }}
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <button type="button" @click="openStatusModal(job)" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 dark:hover:ring-slate-600 transition" :class="statusBadgeClass(job.status)">
                  {{ $t(`statuses.${job.status}`) }}
                </button>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{{ $t('jobs.created') }}</span>
                  <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">{{ formatDate(job.created_at) }}</span>
                  <span class="text-[10px] font-bold text-rose-400 uppercase mt-1">{{ $t('jobs.ends') }}</span>
                  <span class="text-xs text-rose-600 dark:text-rose-400 font-bold">{{ formatDate(job.end_date) }}</span>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right rtl:text-left">
                <div class="flex justify-end rtl:justify-start gap-1.5">
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer" :title="$t('common.view')" @click="openView(job)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer" :title="$t('common.delete')" @click="confirmDel(job)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BasePagination
      v-if="pagination.total > 0"
      :currentPage="pageNumber"
      :totalPages="pagination.last_page || 1"
      :totalItems="pagination.total || 0"
      :itemsPerPage="rowsPerPage"
      @change="onPageChange"
    />

    <ConfirmModal
      :show="showDeleteModal"
      :title="$t('jobs.deleteJob')"
      :message="$t('jobs.deleteConfirm', { title: `<strong>${localField(selectedJob, 'title')}</strong>` })"
      :confirm-text="$t('common.delete')"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />

    <!-- Status Change Modal -->
    <div v-if="showStatusModal && statusTargetJob" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="showStatusModal = false">
      <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up overflow-hidden">
        <div class="p-6 pb-0">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('jobs.changeStatus') || 'Change Status' }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">{{ localField(statusTargetJob, 'title') }}</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.status') }}</label>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 flex-1">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold" :class="statusBadgeClass(statusTargetJob.status)">
                  {{ $t(`statuses.${statusTargetJob.status}`) }}
                </span>
                <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </div>
              <select v-model="statusNewValue" class="flex-1 p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px]" style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');">
                <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ $t(`statuses.${opt}`) }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="showStatusModal = false">
            {{ $t('common.cancel') }}
          </button>
          <button type="button" :disabled="statusNewValue === statusTargetJob.status" class="inline-flex items-center justify-center gap-1.5 py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer" @click="confirmStatusChange">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
