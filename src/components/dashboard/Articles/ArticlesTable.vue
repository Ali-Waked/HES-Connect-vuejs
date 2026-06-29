<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '@/stores/dashboard';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useArticles } from '../../../composables/useArticles';
import { getCategories, getTags, updateArticleStatus } from '../../../services/articleService';
import CategoryBadge from '../../shared/CategoryBadge.vue';
import { getStaff } from '../../../services/staffService';
import ArticleModal from './ArticleModal.vue';
import ArticleViewModal from './ArticleViewModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const store = useDashboardStore();
const { formatDate } = useFormatDate();
const { articles, loading, stats, statsLoading, deleteArticle, pagination, fetchArticles, fetchArticleStats, updateArticle } = useArticles();

const searchQuery = ref('');
const statusFilter = ref('all');
const categoryFilter = ref('');
const authorFilter = ref('');
const pageNumber = ref(1);
const rowsPerPage = ref(10);

const categories = ref([]);
const authors = ref([]);

const showFormModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const selectedArticle = ref(null);
const viewArticleUuid = ref(null);

watch(() => showFormModal.value, (val) => {
  if (!val) {
    const params = parseParams(route.query)
    fetchArticles(params)
    fetchArticleStats()
  }
});

async function loadFilters() {
  try {
    const [catRes, staffRes] = await Promise.all([
      getCategories(),
      getStaff({ per_page: 1000 }),
    ]);
    categories.value = catRes.data.data || catRes.data;
    authors.value = staffRes.data.data;
  } catch (e) {
    // ignore
  }
}
loadFilters();

function parseParams(query) {
  return {
    search: query.search || '',
    status: query.status && query.status !== 'all' ? query.status : '',
    category_id: query.category_id || '',
    author_id: query.author_id || '',
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
    categoryFilter.value = params.category_id || ''
    authorFilter.value = params.author_id || ''
    pageNumber.value = params.page
    rowsPerPage.value = params.per_page
    fetchArticles(params)
  },
  { immediate: true }
)

fetchArticleStats()

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

function onCategoryChange(val) {
  categoryFilter.value = val
  pushQuery({ category_id: val || undefined, page: undefined })
}

function onAuthorChange(val) {
  authorFilter.value = val
  pushQuery({ author_id: val || undefined, page: undefined })
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
  pushQuery({ search: undefined, status: undefined, category_id: undefined, author_id: undefined, page: undefined })
}

const openAddModal = () => {
  selectedArticle.value = null;
  showFormModal.value = true;
};

const openEditModal = (article) => {
  selectedArticle.value = article;
  showFormModal.value = true;
};

const openViewModal = (article) => {
  viewArticleUuid.value = article.uuid;
  showViewModal.value = true;
};

const confirmDelete = (article) => {
  selectedArticle.value = article;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (selectedArticle.value) {
    await deleteArticle(selectedArticle.value.uuid);
    showDeleteModal.value = false;
    selectedArticle.value = null;
  }
};

const statusOptions = ['draft', 'pending_review', 'published', 'archived', 'rejected'];
const showStatusModal = ref(false);
const statusTargetArticle = ref(null);
const statusNewValue = ref('');

function openStatusModal(article) {
  statusTargetArticle.value = article;
  statusNewValue.value = article.status;
  showStatusModal.value = true;
}

async function confirmStatusChange() {
  const article = statusTargetArticle.value;
  if (!article || statusNewValue.value === article.status) {
    showStatusModal.value = false;
    return;
  }
  try {
    await updateArticleStatus(article.uuid, statusNewValue.value);
    store.addToast(t('articles.updated') || 'Article updated successfully', 'success');
    const params = parseParams(route.query);
    await Promise.all([fetchArticles(params), fetchArticleStats()]);
  } catch (e) {
    // silently fail
  }
  showStatusModal.value = false;
}

const statusBadgeClass = (status) => {
  const map = {
    published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return map[status] || map.draft;
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('articles.management') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ pagination.total || 0 }} {{ $t('articles.registered') || 'articles' }}</p>
      </div>
      <button
        class="inline-flex items-center justify-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAddModal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {{ $t('articles.newArticle') }}
      </button>
    </div>

    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.total') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.total }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.pending') || 'Pending Review' }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.pending }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.published') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.published }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.other') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.other }}</p>
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
          :placeholder="$t('articles.searchPlaceholder')"
          :value="searchQuery"
          @input="onSearchInput($event.target.value)"
        />
      </div>
      <select
        class="min-w-[150px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="statusFilter" @change="onStatusChange($event.target.value)"
      >
        <option value="all">{{ $t('articles.allStatus') }}</option>
        <option value="draft">{{ $t('statuses.draft') }}</option>
        <option value="pending_review">{{ $t('statuses.pending_review') }}</option>
        <option value="published">{{ $t('statuses.published') }}</option>
        <option value="archived">{{ $t('statuses.archived') }}</option>
        <option value="rejected">{{ $t('statuses.rejected') }}</option>
      </select>
      <select
        class="min-w-[150px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="categoryFilter" @change="onCategoryChange($event.target.value)"
      >
        <option value="">{{ $t('articles.allCategories') }}</option>
        <option v-for="cat in categories" :key="cat.uuid || cat.id" :value="cat.uuid || cat.id">{{ localField(cat, 'name') }}</option>
      </select>
      <select
        class="min-w-[150px] p-2.5 pr-9 rtl:pr-2.5 rtl:pl-9 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] rtl:bg-[left_12px_center] bg-[length:16px] transition"
        style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
        :value="authorFilter" @change="onAuthorChange($event.target.value)"
      >
        <option value="">{{ $t('articles.allAuthors') || 'All Authors' }}</option>
        <option v-for="author in authors" :key="author.uuid || author.id" :value="author.uuid || author.id">{{ localField(author, 'name') }}</option>
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
      <div v-if="articles?.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ $t('articles.noResults') }}</p>
        <button class="inline-flex items-center justify-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer" @click="resetFilters">{{ $t('common.resetFilters') }}</button>
      </div>

      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left rtl:text-right">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[18%]">{{ $t('common.name') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[12%]">{{ $t('articles.category') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[16%]">{{ $t('articles.tags') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%]">{{ $t('articles.status') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[8%]">{{ $t('articles.views') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[13%]">{{ $t('common.date') }}</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right rtl:text-left w-[12%]">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="article in articles" :key="article.uuid || article.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4">
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(article, 'title') }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <CategoryBadge v-if="article.category" :category="article.category" size="sm" />
                <span v-else class="text-sm text-slate-400">—</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(tag, i) in (article.tags || []).slice(0, 3)" :key="tag.id" class="inline-flex items-center px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[11px] font-bold rounded-full border border-brand-primary/20 max-w-[140px] truncate" :title="localField(tag, 'name')">
                    #{{ localField(tag, 'name') }}
                  </span>
                  <span v-if="(article.tags || []).length > 3" class="text-[11px] text-slate-400 font-semibold self-center">+{{ (article.tags || []).length - 3 }} more</span>
                  <span v-if="!article.tags || article.tags.length === 0" class="text-sm text-slate-400">—</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button type="button" @click="openStatusModal(article)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 dark:hover:ring-slate-600 transition" :class="statusBadgeClass(article.status)">
                  {{ $t(`statuses.${article.status}`) }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ article.views || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ formatDate(article.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right rtl:text-left">
                <div class="flex justify-end rtl:justify-start gap-1.5">
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer" :title="$t('common.view')" @click="openViewModal(article)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer" :title="$t('common.edit')" @click="openEditModal(article)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition cursor-pointer" :title="$t('common.delete')" @click="confirmDelete(article)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
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

    <BasePagination
      v-if="pagination.total > 0"
      :currentPage="pageNumber"
      :totalPages="pagination.last_page || 1"
      :totalItems="pagination.total || 0"
      :itemsPerPage="rowsPerPage"
      @change="onPageChange"
    />

    <ArticleModal :show="showFormModal" :article="selectedArticle" @close="showFormModal = false" />
    <ArticleViewModal :show="showViewModal" :article-uuid="viewArticleUuid" @close="showViewModal = false; viewArticleUuid = null" />
    <ConfirmModal
      :show="showDeleteModal"
      :title="$t('articles.deleteArticle')"
      :message="$t('articles.deleteConfirm', { name: localField(selectedArticle, 'title') })"
      :confirm-text="$t('common.delete')"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />

    <!-- Status Change Modal -->
    <div v-if="showStatusModal && statusTargetArticle" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="showStatusModal = false">
      <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up overflow-hidden">
        <div class="p-6 pb-0">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('articles.changeStatus') || 'Change Status' }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">{{ localField(statusTargetArticle, 'title') }}</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.status') || 'Status' }}</label>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 flex-1">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold" :class="statusBadgeClass(statusTargetArticle.status)">
                  {{ $t(`statuses.${statusTargetArticle.status}`) }}
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
          <button type="button" :disabled="statusNewValue === statusTargetArticle.status" class="inline-flex items-center justify-center gap-1.5 py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer" @click="confirmStatusChange">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
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
