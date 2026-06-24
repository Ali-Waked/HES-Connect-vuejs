<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '../../../stores/dashboard';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useStaff } from '../../../composables/useStaff';
import { useFormatDate } from '../../../composables/useFormatDate';
import StaffModal from './StaffModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';
import BaseBadge from '../global/BaseBadge.vue';
import * as staffService from '../../../services/staffService';
import { getFacilities } from '../../../services/facilityService';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const store = useDashboardStore();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const { staff, loading, error, pagination, fetchStaff, terminateFacilityStaff } = useStaff();

const searchQuery = ref('');
const facilityFilter = ref('all');
const statusFilter = ref('all');
const facilities = ref([]);
const sortField = ref('');
const sortOrder = ref('asc');
const pageNumber = ref(1);
const rowsPerPage = ref(15);

const showDeleteModal = ref(false);
const showTerminateFacilityModal = ref(false);
const showFormModal = ref(false);
const selectedMember = ref(null);
const selectedFacilityStaff = ref(null);
const expandedStaffUuid = ref(null);

const columns = [
  { key: 'name', label: () => t('staff.name') || 'Name', align: 'left', width: 'w-[24%]', sortable: true },
  { key: 'email', label: () => t('staff.email') || 'Email', align: 'left', width: 'w-[20%]', sortable: false },
  { key: 'facilities', label: () => t('staff.facilities') || 'Facilities', align: 'left', width: 'w-[24%]', sortable: false },
  { key: 'status', label: () => t('common.status') || 'Status', align: 'left', width: 'w-[10%]', sortable: false },
  { key: 'actions', label: () => t('common.actions') || 'Actions', align: 'end', width: 'w-[22%]' },
];

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500'];
const avatarColor = (name) => avatarColors[name ? name.charCodeAt(0) % avatarColors.length : 0];
const initial = (name) => name ? name.replace(/^(Dr\.|Dr)\s+/i, '').charAt(0).toUpperCase() : '?';

const statusFilters = [
  { key: 'all', label: t('staff.allStaff') || 'All Staff' },
  { key: 'active', label: t('staff.activeStaff') || 'Active Staff' },
  { key: 'former', label: t('staff.formerStaff') || 'Former Staff' },
  { key: 'doctors', label: t('staff.doctorsOnly') || 'Doctors Only' },
];

function parseParams(query) {
  return {
    search: query.search || '',
    facility_id: query.facility_id && query.facility_id !== 'all' ? query.facility_id : '',
    status: query.status && query.status !== 'all' ? query.status : '',
    page: parseInt(query.page) || 1,
    per_page: parseInt(query.per_page) || 15,
    sort: query.sort || '',
    order: query.order || 'asc',
  }
}

watch(
  () => route.query,
  (query) => {
    const params = parseParams(query)
    searchQuery.value = params.search
    facilityFilter.value = params.facility_id || 'all'
    statusFilter.value = params.status || 'all'
    sortField.value = params.sort
    sortOrder.value = params.order
    pageNumber.value = params.page
    rowsPerPage.value = params.per_page
    fetchStaff(params)
  },
  { immediate: true }
)

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

onMounted(async () => {
  try {
    const { data } = await getFacilities({ per_page: 1000 })
    facilities.value = data.data
  } catch (e) { /* silently fail */ }
})

let searchTimeout

function onSearchInput(val) {
  searchQuery.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pushQuery({ search: val, page: undefined })
  }, 400)
}

function onFacilityChange(val) {
  facilityFilter.value = val
  pushQuery({ facility_id: val, page: undefined })
}

function onStatusFilterChange(key) {
  statusFilter.value = key
  pushQuery({ status: key, page: undefined })
}

function toggleSort(key) {
  if (sortField.value === key) {
    const next = sortOrder.value === 'asc' ? 'desc' : 'asc'
    pushQuery({ sort: key, order: next, page: undefined })
  } else {
    pushQuery({ sort: key, order: 'asc', page: undefined })
  }
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
  pushQuery({ search: undefined, facility_id: undefined, status: undefined, sort: undefined, order: undefined, page: undefined })
}

const openAddModal = () => {
  selectedMember.value = null;
  showFormModal.value = true;
};

const openEditModal = (member) => {
  selectedMember.value = member;
  showFormModal.value = true;
};

const confirmDel = (member) => {
  selectedMember.value = member;
  showDeleteModal.value = true;
};

const confirmFacilityTerminate = (facility, member) => {
  selectedFacilityStaff.value = { ...facility, staffName: localField(member.user, 'name') };
  showTerminateFacilityModal.value = true;
};

const toggleExpand = (uuid) => {
  expandedStaffUuid.value = expandedStaffUuid.value === uuid ? null : uuid;
};

const handleDelete = async () => {
  if (selectedMember.value) {
    try {
      await staffService.deleteStaff(selectedMember.value.uuid)
      store.addToast('Staff member deleted successfully', 'success')
      showDeleteModal.value = false
      selectedMember.value = null
      if (staff.value.length <= 1 && (pageNumber.value || 1) > 1) {
        pushQuery({ page: undefined })
      } else {
        fetchStaff(parseParams(route.query))
      }
    } catch (err) {
      store.addToast('Failed to delete staff member', 'error')
    }
  }
};

const handleTerminate = async () => {
  if (selectedFacilityStaff.value) {
    await terminateFacilityStaff(selectedFacilityStaff.value.facility_staff_uuid);
    showTerminateFacilityModal.value = false;
    selectedFacilityStaff.value = null;
  }
};

function isActive(member) {
  return member.facilities?.some(f => !f.ended_at)
}

function isFormer(member) {
  return member.facilities?.every(f => f.ended_at)
}

function isDoctor(member) {
  return member.facilities?.some(f => f.role?.slug === 'doctor')
}

function getRoleBadgeVariant(roleSlug) {
  const map = {
    doctor: 'primary',
    nurse: 'info',
    pharmacist: 'warning',
    receptionist: 'neutral',
    facility_owner: 'success',
  }
  return map[roleSlug] || 'neutral'
}

const filteredStaff = computed(() => {
  if (!staff.value) return []
  return staff.value.filter(member => {
    if (statusFilter.value === 'all') return true
    if (statusFilter.value === 'active') return isActive(member)
    if (statusFilter.value === 'former') return isFormer(member)
    if (statusFilter.value === 'doctors') return isDoctor(member)
    return true
  })
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="flex items-start gap-3">
        <button
          class="mt-1 p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          :title="t('common.back')"
          @click="router.push('/platform/users')"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Management</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ pagination.total || 0 }} registered {{ pagination.total === 1 ? 'member' : 'members' }}
          </p>
        </div>
      </div>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAddModal"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Add Staff
      </button>
    </div>

    <!-- Status Filter Chips -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in statusFilters"
        :key="f.key"
        class="px-3.5 py-1.5 text-xs font-semibold rounded-full border transition cursor-pointer"
        :class="statusFilter === f.key
          ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
        @click="onStatusFilterChange(f.key)"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Controls Bar -->
    <div class="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-1">
      <div class="relative min-w-[200px] flex-grow">
        <svg class="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4.5 h-4.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          class="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
          placeholder="Search by name, email..."
          :value="searchQuery"
          @input="onSearchInput($event.target.value)"
        />
      </div>
      <select
        class="min-w-[180px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="facilityFilter" @change="onFacilityChange($event.target.value)"
      >
        <option value="all">All Facilities</option>
        <option v-for="fac in facilities" :key="fac.uuid" :value="fac.uuid">{{ localField(fac, 'name') }}</option>
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
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading staff...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
      <div class="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-red-600 dark:text-red-400">{{ error }}</p>
      <button
        class="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer"
        @click="fetchStaff(parseParams(route.query))"
      >
        Retry
      </button>
    </div>

    <!-- Table Card -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <!-- Empty state -->
      <div v-if="filteredStaff?.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">No staff members found</p>
        <button
          class="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer"
          @click="resetFilters"
        >
          Reset Filters
        </button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left rtl:text-right min-w-[1000px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-5 py-3.5 w-[2%]"></th>
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none"
                :class="[
                  col.width,
                  col.align === 'end' ? 'text-right rtl:text-left' : 'text-left rtl:text-right',
                  col.sortable ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' : ''
                ]"
                @click="col.sortable ? toggleSort(col.key) : null"
              >
                <span class="inline-flex items-center gap-1">
                  {{ col.label() }}
                  <span v-if="col.sortable && sortField === col.key" class="inline-flex flex-col leading-none text-[8px]">
                    <span :class="sortOrder === 'asc' ? 'text-brand-primary' : 'text-slate-300'">&#9650;</span>
                    <span :class="sortOrder === 'desc' ? 'text-brand-primary' : 'text-slate-300'">&#9660;</span>
                  </span>
                  <svg v-else-if="col.sortable" class="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                  </svg>
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <template v-for="member in filteredStaff" :key="member.uuid">
              <!-- Main row -->
              <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" @click="toggleExpand(member.uuid)">
                <td class="px-5 py-3.5">
                  <button type="button" class="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer">
                    <svg class="w-4 h-4 transition-transform" :class="expandedStaffUuid === member.uuid ? 'rotate-90' : ''" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </td>

                <!-- Name -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <img v-if="member.user?.avatar" :src="member.user.avatar" alt="" class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <div v-else :class="`w-9 h-9 rounded-full ${avatarColor(localField(member.user, 'name'))} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`">
                      {{ initial(localField(member.user, 'name')) }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ localField(member.user, 'name') }}</p>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {{ member.user?.email || '—' }}
                </td>

                <!-- Facilities badges -->
                <td class="px-5 py-3.5 text-sm">
                  <template v-if="member.facilities?.length">
                    <div class="flex flex-wrap gap-1">
                      <BaseBadge v-for="fac in member.facilities" :key="fac.uuid" variant="neutral">
                        {{ localField(fac, 'name') }}
                      </BaseBadge>
                    </div>
                  </template>
                  <span v-else class="text-slate-400">—</span>
                </td>

                <!-- Status -->
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <BaseBadge v-if="isActive(member)" variant="success">{{ t('statuses.active') || 'Active' }}</BaseBadge>
                  <BaseBadge v-else variant="danger">{{ t('statuses.inactive') || 'Inactive' }}</BaseBadge>
                </td>

                <!-- Actions -->
                <td class="px-5 py-3.5 whitespace-nowrap text-right rtl:text-left">
                  <div class="flex justify-end rtl:justify-start gap-1">
                    <button
                      class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                      :title="t('common.view')"
                      @click.stop="router.push(`/platform/staff/${member.uuid}`)"
                    >
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                      :title="t('common.edit')"
                      @click.stop="openEditModal(member)"
                    >
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                    </button>
                    <button
                      class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer"
                      :title="t('common.delete')"
                      @click.stop="confirmDel(member)"
                    >
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Expanded facility details row -->
              <tr v-if="expandedStaffUuid === member.uuid">
                <td colspan="7" class="px-0 py-0">
                  <div class="bg-slate-50/70 dark:bg-slate-800/20 border-t border-b border-slate-100 dark:border-slate-800">
                    <template v-if="member.facilities?.length">
                      <table class="w-full text-left rtl:text-right min-w-[800px]">
                        <thead>
                          <tr class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <th class="px-5 py-2.5 pl-14">{{ t('staff.facility') || 'Facility' }}</th>
                            <th class="px-5 py-2.5">{{ t('staff.role') || 'Role' }}</th>
                            <th class="px-5 py-2.5">{{ t('staff.position') || 'Position' }}</th>
                            <th class="px-5 py-2.5">{{ t('staff.department') || 'Department' }}</th>
                            <th class="px-5 py-2.5">{{ t('staff.joinedAt') || 'Joined' }}</th>
                            <th class="px-5 py-2.5 text-right">{{ t('common.actions') || 'Actions' }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                          <tr v-for="fac in member.facilities" :key="fac.uuid" class="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td class="px-5 py-3 pl-14 text-sm font-semibold text-slate-700 dark:text-slate-300">{{ localField(fac, 'name') }}</td>
                            <td class="px-5 py-3 text-sm">
                              <BaseBadge :variant="getRoleBadgeVariant(fac.role?.slug)">
                                {{ localField(fac.role, 'name') }}
                              </BaseBadge>
                            </td>
                            <td class="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{{ fac.position ? localField(fac.position, 'name') : '—' }}</td>
                            <td class="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{{ fac.department ? localField(fac.department, 'name') : '—' }}</td>
                            <td class="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">{{ fac.joined_at ? formatDate(fac.joined_at) : '—' }}</td>
                            <td class="px-5 py-3 text-sm text-right rtl:text-left">
                              <button
                                v-if="!fac.ended_at"
                                class="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-200 dark:border-amber-800 transition cursor-pointer"
                                :title="t('staff.terminate') || 'Terminate'"
                                @click.stop="confirmFacilityTerminate(fac, member)"
                              >
                                <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                </svg>
                                {{ t('staff.terminate') || 'Terminate' }}
                              </button>
                              <span v-else class="text-xs text-slate-400 italic">{{ t('staff.terminated') || 'Terminated' }}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </template>
                    <div v-else class="px-5 py-4 pl-14 text-sm text-slate-400 italic">
                      {{ t('staff.noFacilities') || 'No facility assignments' }}
                    </div>
                  </div>
                </td>
              </tr>
            </template>
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

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Staff Member"
      :message="`Are you sure you want to delete <strong>${localField(selectedMember?.user, 'name')}</strong>?`"
      confirm-text="Delete"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />

    <!-- Terminate Facility Assignment Confirm Modal -->
    <ConfirmModal
      :show="showTerminateFacilityModal"
      title="Terminate Facility Assignment"
      :message="`Terminate <strong>${localField(selectedFacilityStaff, 'name')}</strong> assignment for <strong>${selectedFacilityStaff?.staffName || ''}</strong>? This will end their role at this facility.`"
      confirm-text="Terminate"
      :is-danger="false"
      @confirm="handleTerminate"
      @close="showTerminateFacilityModal = false"
    />

    <!-- Staff Create/Edit Modal -->
    <StaffModal
      :show="showFormModal"
      :staff-member="selectedMember"
      @close="showFormModal = false; fetchStaff(parseParams(route.query))"
    />

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
