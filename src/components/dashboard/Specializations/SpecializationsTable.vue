<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useSpecializations } from '../../../composables/useSpecializations';
import SpecializationFormModal from './SpecializationFormModal.vue';
import SpecializationSymptomsModal from './SpecializationSymptomsModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const { specializations, loading, deleteSpecialization, pagination, fetchSpecializations } = useSpecializations();

const searchQuery = ref('');
const pageNumber = ref(1);
const rowsPerPage = ref(10);

const showFormModal = ref(false);
const showDeleteModal = ref(false);
const showSymptomsModal = ref(false);
const selectedSpec = ref(null);

watch(() => showFormModal.value, (val) => {
  if (!val) {
    const params = parseParams(route.query);
    fetchSpecializations(params);
  }
});

watch(() => showSymptomsModal.value, (val) => {
  if (!val) {
    const params = parseParams(route.query);
    fetchSpecializations(params);
  }
});

function parseParams(query) {
  return {
    search: query.search || '',
    page: parseInt(query.page) || 1,
    per_page: parseInt(query.per_page) || 10,
    sort_by: query.sort_by || 'created_at',
    order_by: query.order_by || 'desc',
  }
}

watch(
  () => route.query,
  (query) => {
    const params = parseParams(query);
    searchQuery.value = params.search;
    pageNumber.value = params.page;
    rowsPerPage.value = params.per_page;
    fetchSpecializations(params);
  },
  { immediate: true }
)

function pushQuery(updates) {
  const query = { ...route.query };
  for (const [key, val] of Object.entries(updates)) {
    if (val === '' || val === undefined || val === null) {
      delete query[key];
    } else {
      query[key] = String(val);
    }
  }
  router.push({ query });
}

let searchTimeout;

function onSearchInput(val) {
  searchQuery.value = val;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pushQuery({ search: val, page: undefined });
  }, 400);
}

function onPageChange(page) {
  clearTimeout(searchTimeout);
  pushQuery({ page: page > 1 ? page : undefined });
}

function onPerPageChange(val) {
  rowsPerPage.value = parseInt(val);
  pushQuery({ per_page: val, page: undefined });
}

function resetFilters() {
  clearTimeout(searchTimeout);
  pushQuery({ search: undefined, page: undefined });
}

const openAddModal = () => {
  selectedSpec.value = null;
  showFormModal.value = true;
};

const openEditModal = (spec) => {
  selectedSpec.value = spec;
  showFormModal.value = true;
};

const openSymptomsModal = (spec) => {
  selectedSpec.value = spec;
  showSymptomsModal.value = true;
};

const confirmDelete = (spec) => {
  selectedSpec.value = spec;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (selectedSpec.value) {
    await deleteSpecialization(selectedSpec.value.uuid);
    showDeleteModal.value = false;
    selectedSpec.value = null;
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('specializations.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ pagination.total || 0 }} {{ $t('specializations.registered') }}</p>
      </div>
      <button
        class="inline-flex items-center justify-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAddModal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {{ $t('specializations.add') }}
      </button>
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
          :placeholder="$t('specializations.searchPlaceholder')"
          :value="searchQuery"
          @input="onSearchInput($event.target.value)"
        />
      </div>
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
      <div v-if="specializations?.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ $t('specializations.noResults') }}</p>
        <button class="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer" @click="resetFilters">{{ $t('common.resetFilters') }}</button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left rtl:text-right">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">{{ $t('specializations.nameEn') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">{{ $t('specializations.nameAr') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">{{ $t('specializations.description') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%]">{{ $t('specializations.symptomsCount') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[14%]">{{ $t('common.date') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right rtl:text-left w-[16%]">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="spec in specializations" :key="spec.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                {{ spec.name?.en || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300 text-right" dir="rtl">
                {{ spec.name?.ar || '—' }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                {{ spec.description?.en || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  class="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition cursor-pointer"
                  @click="openSymptomsModal(spec)"
                >
                  <span class="material-symbols-outlined text-[16px]">monitor_heart</span>
                  {{ spec.symptoms_count ?? 0 }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ formatDate(spec.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right rtl:text-left">
                <div class="flex justify-end rtl:justify-start gap-1.5">
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-brand-primary/10 p-1.5 rounded-lg transition cursor-pointer"
                    :title="$t('specializations.manageSymptoms')"
                    @click="openSymptomsModal(spec)"
                  >
                    <span class="material-symbols-outlined text-[16px]">monitor_heart</span>
                  </button>
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                    :title="$t('common.edit')"
                    @click="openEditModal(spec)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer"
                    :title="$t('common.delete')"
                    @click="confirmDelete(spec)"
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

    <SpecializationFormModal :show="showFormModal" :specialization="selectedSpec" @close="showFormModal = false" />
    <SpecializationSymptomsModal :show="showSymptomsModal" :specialization="selectedSpec" @close="showSymptomsModal = false" />
    <ConfirmModal
      :show="showDeleteModal"
      :title="$t('specializations.deleteTitle') || 'Delete Specialization'"
      :message="`Are you sure you want to delete specialization <strong>${localField(selectedSpec, 'name')}</strong>?`"
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
