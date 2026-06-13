<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useDashboardHelpers } from '../../../composables/useDashboardHelpers';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useFacilities } from '../../../composables/useFacilities';
import FacilityModal from './FacilityModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const { getTypeClass, getMapLink } = useDashboardHelpers();
const { formatDate } = useFormatDate();
const { facilities, loading, stats, deleteFacility, pagination, fetchFacilities, fetchFacilityStats } = useFacilities();

const searchQuery = ref('');
const typeFilter = ref('all');
const statusFilter = ref('all');
const approvalFilter = ref('all');
const pageNumber = ref(1);
const rowsPerPage = ref(10);

const showFormModal = ref(false);
const showDeleteModal = ref(false);
const selectedFacility = ref(null);

watch(() => showFormModal.value, (val) => {
  if (!val) {
    const params = parseParams(route.query)
    fetchFacilities(params)
    fetchFacilityStats()
  }
});

const facilityTypeOptions = [
  { value: 'hospital', label: 'categories.hospital' },
  { value: 'clinic', label: 'categories.clinic' },
  { value: 'pharmacy', label: 'categories.pharmacy' },
  { value: 'medical_point', label: 'categories.medicalPoint' },
]

function facilityTypeLabel(type) {
  const map = {
    hospital: 'categories.hospital',
    clinic: 'categories.clinic',
    pharmacy: 'categories.pharmacy',
    medical_point: 'categories.medicalPoint',
  }
  return map[type] || 'categories.hospital'
}

function parseParams(query) {
  return {
    search: query.search || '',
    facility_type: query.facility_type && query.facility_type !== 'all' ? query.facility_type : '',
    status: query.status && query.status !== 'all' ? query.status : '',
    approval_status: query.approval_status && query.approval_status !== 'all' ? query.approval_status : '',
    page: parseInt(query.page) || 1,
    per_page: parseInt(query.per_page) || 10,
  }
}

watch(
  () => route.query,
  (query) => {
    const params = parseParams(query)
    searchQuery.value = params.search
    typeFilter.value = params.facility_type || 'all'
    statusFilter.value = params.status || 'all'
    approvalFilter.value = params.approval_status || 'all'
    pageNumber.value = params.page
    rowsPerPage.value = params.per_page
    fetchFacilities(params)
  },
  { immediate: true }
)

fetchFacilityStats()

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

function onTypeChange(val) {
  typeFilter.value = val
  pushQuery({ facility_type: val, page: undefined })
}

function onStatusChange(val) {
  statusFilter.value = val
  pushQuery({ status: val, page: undefined })
}

function onApprovalChange(val) {
  approvalFilter.value = val
  pushQuery({ approval_status: val, page: undefined })
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
  pushQuery({ search: undefined, facility_type: undefined, status: undefined, approval_status: undefined, page: undefined })
}

const openAddModal = () => {
  selectedFacility.value = null;
  showFormModal.value = true;
};

const openEditModal = (facility) => {
  selectedFacility.value = facility;
  showFormModal.value = true;
};

const confirmDelete = (facility) => {
  selectedFacility.value = facility;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (selectedFacility.value) {
    await deleteFacility(selectedFacility.value.uuid);
    showDeleteModal.value = false;
    selectedFacility.value = null;
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('nav.facilities') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ pagination.total || 0 }} {{ $t('facilities.registered') || 'registered facilities' }}</p>
      </div>
      <button
        class="inline-flex items-center justify-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAddModal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {{ $t('facilities.addFacility') }}
      </button>
    </div>

    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('facilities.total') || 'Total Facilities' }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.total }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('statuses.approved') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.approved }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('statuses.pending') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.pending }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('statuses.rejected') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.rejected }}</p>
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
          :placeholder="$t('common.search')"
          :value="searchQuery"
          @input="onSearchInput($event.target.value)"
        />
      </div>
      <select
        class="min-w-[140px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="typeFilter" @change="onTypeChange($event.target.value)"
      >
        <option value="all">{{ $t('facilities.allTypes') || 'All Types' }}</option>
        <option v-for="opt in facilityTypeOptions" :key="opt.value" :value="opt.value">{{ $t(opt.label) }}</option>
      </select>
      <select
        class="min-w-[180px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="statusFilter" @change="onStatusChange($event.target.value)"
      >
        <option value="all">{{ $t('facilities.allStatus') || 'All Status' }}</option>
        <option value="pending">{{ $t('statuses.pending') }}</option>
        <option value="active">{{ $t('statuses.active') }}</option>
        <option value="inactive">{{ $t('statuses.inactive') }}</option>
        <option value="temporarily_closed">{{ $t('statuses.temporarily_closed') }}</option>
        <option value="permanently_closed">{{ $t('statuses.permanently_closed') }}</option>
      </select>
      <select
        class="min-w-[140px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="approvalFilter" @change="onApprovalChange($event.target.value)"
      >
        <option value="all">{{ $t('facilities.allApproval') || 'All Approval' }}</option>
        <option value="approved">{{ $t('statuses.approved') }}</option>
        <option value="pending">{{ $t('statuses.pending') }}</option>
        <option value="rejected">{{ $t('statuses.rejected') }}</option>
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
      <!-- Empty state -->
      <div v-if="facilities?.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ $t('common.noResults') }}</p>
        <button class="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer" @click="resetFilters">{{ $t('common.resetFilters') }}</button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left rtl:text-right">
            <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[8%]">{{ $t('facilities.coverImage') || 'Cover' }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">{{ $t('common.name') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[11%]">{{ $t('facilities.type') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">{{ $t('facilities.organization') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[9%]">{{ $t('common.status') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%]">{{ $t('facilities.approval') || 'Approval' }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[14%]">{{ $t('facilities.location') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[6%]">{{ $t('facilities.files') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right rtl:text-left w-[7%]">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="facility in facilities" :key="facility.uuid || facility.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img v-if="facility.cover_image" :src="facility.cover_image" class="w-full h-full object-cover" alt="Cover" />
                  <span v-else class="material-symbols-outlined text-lg text-slate-400">image</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(facility, 'name') }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="getTypeClass(facility.type)">
                  {{ $t(facilityTypeLabel(facility.type)) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ facility.organization ? localField(facility.organization, 'name') : (facility.organization_name || '—') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="{
                  'bg-amber-100 text-amber-800': facility.status === 'pending',
                  'bg-emerald-100 text-emerald-800': facility.status === 'active',
                  'bg-slate-100 text-slate-600': facility.status === 'inactive',
                  'bg-orange-100 text-orange-800': facility.status === 'temporarily_closed',
                  'bg-red-100 text-red-800': facility.status === 'permanently_closed',
                }">
                  {{ $t(`statuses.${facility.status}`) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="{
                  'bg-emerald-100 text-emerald-800': facility.approval_status === 'approved',
                  'bg-amber-100 text-amber-800': facility.approval_status === 'pending',
                  'bg-red-100 text-red-800': facility.approval_status === 'rejected'
                }">
                  {{ $t(`statuses.${facility.approval_status}`) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <template v-if="facility.location || (facility.latitude != null && facility.longitude != null)">
                    <a
                      :href="getMapLink(facility.location || `${facility.latitude}, ${facility.longitude}`)"
                      target="_blank"
                      class="inline-flex items-center gap-1 text-brand-primary font-medium hover:underline cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ facility.location || `${facility.latitude}, ${facility.longitude}` }}
                    </a>
                  </template>
                  <span v-else class="text-slate-400 dark:text-slate-500">—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ facility.files || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right rtl:text-left">
                <div class="flex justify-end rtl:justify-start gap-1.5">
                  <router-link
                    :to="`/admin/facilities/${facility.uuid}`"
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer inline-flex"
                    :title="$t('common.view')"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer" :title="$t('common.edit')" @click="openEditModal(facility)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer" :title="$t('common.delete')" @click="confirmDelete(facility)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <BasePagination
      v-if="pagination.total > 0"
      :currentPage="pageNumber"
      :totalPages="pagination.last_page || 1"
      :totalItems="pagination.total || 0"
      :itemsPerPage="rowsPerPage"
      @change="onPageChange"
    />

    <FacilityModal :show="showFormModal" :facility="selectedFacility" @close="showFormModal = false" />
    <ConfirmModal
      :show="showDeleteModal"
      :title="$t('facilities.deleteFacility')"
      :message="$t('facilities.deleteConfirm', { name: localField(selectedFacility, 'name') })"
      :confirm-text="$t('common.delete')"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
