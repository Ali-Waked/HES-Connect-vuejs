<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '../../../stores/dashboard';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useStaff } from '../../../composables/useStaff';
import { useFormatDate } from '../../../composables/useFormatDate';
import StaffModal from './StaffModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';
import * as staffService from '../../../services/staffService';
import { getFacilities } from '../../../services/facilityService';
import { formatFee, formatExperience } from '../../../utils/staffHelpers';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const store = useDashboardStore();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const { staff, loading, error, pagination, fetchStaff } = useStaff();

const searchQuery = ref('');
const facilityFilter = ref('all');
const facilities = ref([]);
const sortField = ref('');
const sortOrder = ref('asc');
const pageNumber = ref(1);
const rowsPerPage = ref(15);

const showDeleteModal = ref(false);
const showFormModal = ref(false);
const selectedMember = ref(null);

const columns = [
  { key: 'name', label: () => t('staff.name') || 'Name', align: 'left', width: 'w-[18%]', sortable: true },
  { key: 'email', label: () => t('staff.email') || 'Email', align: 'left', width: 'w-[15%]', sortable: false },
  { key: 'specialization', label: () => t('staff.specialization'), align: 'left', width: 'w-[12%]', sortable: false },
  { key: 'facility', label: () => t('staff.facility') || 'Facility', align: 'left', width: 'w-[18%]', sortable: false },
  { key: 'experience', label: () => t('staff.experience') || 'Experience', align: 'left', width: 'w-[8%]', sortable: true },
  { key: 'fee', label: () => 'Fee', align: 'left', width: 'w-[8%]', sortable: true },
  { key: 'actions', label: () => t('common.actions') || 'Actions', align: 'end', width: 'w-[8%]' },
];

const colCount = columns.length;

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500'];
const avatarColor = (name) => avatarColors[name ? name.charCodeAt(0) % avatarColors.length : 0];
const initial = (name) => name ? name.replace(/^(Dr\.|Dr)\s+/i, '').charAt(0).toUpperCase() : '?';

function parseParams(query) {
  return {
    search: query.search || '',
    facility_id: query.facility_id && query.facility_id !== 'all' ? query.facility_id : '',
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
  pushQuery({ search: undefined, facility_id: undefined, sort: undefined, order: undefined, page: undefined })
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

</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="flex items-start gap-3">
        <button
          class="mt-1 p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          :title="t('common.back')"
          @click="router.push('/admin/users')"
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

    <!-- Controls Bar -->
    <div class="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-1">
      <div class="relative min-w-[200px] flex-grow">
        <svg class="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4.5 h-4.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          class="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
          placeholder="Search by name, email, specialization..."
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
      <div v-if="staff?.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
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
        <table class="w-full border-collapse text-left rtl:text-right min-w-[900px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
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
            <tr v-for="member in staff" :key="member.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">

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

              <!-- Specialization -->
              <td class="px-5 py-3.5 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                {{ localField(member, 'specialization') || '—' }}
              </td>

              <!-- Facilities -->
              <td class="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                <template v-if="member.facilities?.length">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-semibold text-slate-700 dark:text-slate-300">{{ localField(member.facilities[0], 'name') }}</span>
                    <span v-if="member.facilities[0].position" class="text-xs text-slate-500 dark:text-slate-400">{{ localField(member.facilities[0].position, 'name') }}</span>
                    <span v-if="member.facilities.length > 1" class="text-xs font-semibold text-brand-primary">+{{ member.facilities.length - 1 }} more</span>
                  </div>
                </template>
                <span v-else>—</span>
              </td>

              <!-- Experience -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <svg class="w-3.5 h-3.5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clip-rule="evenodd"/>
                  </svg>
                  {{ formatExperience(member.experience_years) }}
                </span>
              </td>

              <!-- Fee -->
              <td class="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                {{ formatFee(member.consultation_fee) }}
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5 whitespace-nowrap text-right rtl:text-left">
                <div class="flex justify-end rtl:justify-start gap-1">
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                    :title="t('common.view')"
                    @click="router.push(`/admin/staff/${member.uuid}`)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                    :title="t('common.edit')"
                    @click="openEditModal(member)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer"
                    :title="t('common.delete')"
                    @click="confirmDel(member)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Staff Member"
      :message="`Are you sure you want to delete <strong>${localField(selectedMember?.user, 'name')}</strong>?`"
      confirm-text="Delete"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />

    <!-- Staff Create/Edit Modal -->
    <StaffModal
      :show="showFormModal"
      :staff-member="selectedMember"
      @close="showFormModal = false"
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
