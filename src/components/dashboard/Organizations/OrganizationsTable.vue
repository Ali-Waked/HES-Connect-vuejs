<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useDashboardHelpers } from '../../../composables/useDashboardHelpers';
import { useOrganizations } from '../../../composables/useOrganizations';
import { useFormatDate } from '../../../composables/useFormatDate';
import OrganizationModal from './OrganizationModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const { getTypeClass } = useDashboardHelpers();
const { formatDate } = useFormatDate();
const { organizations, loading, deleteOrganization, pagination, fetchOrganizations } = useOrganizations();

// Local UI state synced from URL (single source of truth)
const searchQuery = ref('');
const typeFilter = ref('all');
const pageNumber = ref(1);
const rowsPerPage = ref(15);

// Modals toggles
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const selectedOrg = ref(null);
const organizationTypes = [
  'private',
  'local_ngo',
  'international_ngo',
  'un_agency',
  'government',
]

function parseParams(query) {
  return {
    search: query.search || '',
    type: query.type && query.type !== 'all' ? query.type : '',
    page: parseInt(query.page) || 1,
    per_page: parseInt(query.per_page) || 15,
  }
}

watch(
  () => route.query,
  (query) => {
    const params = parseParams(query)
    searchQuery.value = params.search
    typeFilter.value = params.type || 'all'
    pageNumber.value = params.page
    rowsPerPage.value = params.per_page
    fetchOrganizations(params)
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
  pushQuery({ type: val, page: undefined })
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
  pushQuery({ search: undefined, type: undefined, page: undefined })
}

// CRUD handlers
const openAddModal = () => {
  selectedOrg.value = null;
  showFormModal.value = true;
};

const openEditModal = async(org) => {
  selectedOrg.value =  org;
  showFormModal.value = true;
};

const confirmDelete = (org) => {
  selectedOrg.value = org;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (selectedOrg.value) {
    console.log(selectedOrg);
    await deleteOrganization(selectedOrg.value.uuid);
    showDeleteModal.value = false;
    selectedOrg.value = null;
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls Bar -->
    <div class="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
      <div class="relative flex-grow">
        <svg class="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4.5 h-4.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          class="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
          :placeholder="$t('organizations.searchPlaceholder')"
          :value="searchQuery"
          @input="onSearchInput($event.target.value)"
        />
      </div>
      <div class="flex gap-2 shrink-0">
      <select 
        class="min-w-[150px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition" 
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="typeFilter" @change="onTypeChange($event.target.value)"
      >
        <option value="all">{{ $t('organizations.allTypes') }}</option>
        <option
          v-for="t in organizationTypes"
          :key="t"
          :value="t"
        >
          {{ $t(`organizationTypes.${t}`) }}
        </option>
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
      <button
        class="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:shadow-brand-primary/20 transition cursor-pointer shrink-0"
        @click="openAddModal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {{ $t('organizations.add') }}
      </button>
      </div>
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
      <div v-if="!loading && organizations?.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
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
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[45%]">{{ $t('common.name') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">{{ $t('organizations.type') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">{{ $t('organizations.created') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">{{ $t('organizations.updated') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%] text-right rtl:text-left">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr 
              v-for="org in organizations" 
              :key="org.id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4.5">
                <div class="flex flex-col gap-0.5">
                  <span class="text-sm font-semibold text-slate-900 dark:text-white leading-normal">{{ localField(org, 'name') }}</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400 leading-normal">{{ localField(org, 'description') }}</span>
                </div>
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="getTypeClass(org.type)">
                  {{ $t(`organizationTypes.${org.type}`) }}
                </span>
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                {{ formatDate(org.created_at) }}
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                {{ formatDate(org.updated_at) }}
              </td>
              <td class="px-6 py-4.5 whitespace-nowrap text-right rtl:text-left">
                <div class="flex justify-end rtl:justify-start gap-1.5">
                  <button 
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                    :title="$t('common.edit')" 
                    @click="openEditModal(org)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer"
                    :title="$t('common.delete')" 
                    @click="confirmDelete(org)"
                  >
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

    <!-- Organization Form Modal -->
    <OrganizationModal 
      :show="showFormModal" 
      :org="selectedOrg"
      @close="showFormModal = false"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal 
      :show="showDeleteModal"
      :title="$t('organizations.delete')"
      :message="`${$t('facilities.deleteConfirm', { name: `<strong>${localField(selectedOrg, 'name')}</strong>` })}`"
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
