<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFormatDate } from '@/composables/useFormatDate'
import { useI18n } from 'vue-i18n'
import axiosClient from '@/axiosClient'
import { useDashboardStore } from '@/stores/dashboard'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'
import FacilityArticleModal from '@/components/facility/FacilityArticleModal.vue'
import FacilityArticleViewModal from '@/components/facility/FacilityArticleViewModal.vue'
import ConfirmModal from '@/components/dashboard/global/ConfirmModal.vue'

const workspaceStore = useWorkspaceStore()
const dashboardStore = useDashboardStore()
const { can } = useAuthPermissions()
const { localField } = useLocaleField()
const { formatDate } = useFormatDate()
const { t } = useI18n()

const articles = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const perPage = ref(15)
const pagination = ref({
  current_page: 1,
  from: 0,
  last_page: 1,
  per_page: 15,
  to: 0,
  total: 0,
})

const categories = ref([])

const showFormModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const selectedArticle = ref(null)
const viewArticleUuid = ref(null)
const deleting = ref(false)

let searchDebounce = null

function debouncedSearch(val) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    search.value = val
    currentPage.value = 1
    fetchArticles()
  }, 400)
}

function setStatusFilter(val) {
  statusFilter.value = val
  currentPage.value = 1
  fetchArticles()
}

function setCategoryFilter(val) {
  categoryFilter.value = val
  currentPage.value = 1
  fetchArticles()
}

function setPage(page) {
  currentPage.value = page
  fetchArticles()
}

async function fetchArticles() {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
    }
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    if (categoryFilter.value) params.category_id = categoryFilter.value

    const { data } = await axiosClient.get('/staff/articles', { params })
    articles.value = data.data || []
    if (data.meta) {
      pagination.value = {
        current_page: data.meta.current_page || 1,
        from: data.meta.from || 0,
        last_page: data.meta.last_page || 1,
        per_page: data.meta.per_page || 15,
        to: data.meta.to || 0,
        total: data.meta.total || 0,
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load articles'
    articles.value = []
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const { data } = await axiosClient.get('/categories/article')
    categories.value = data.data || data || []
  } catch {
    categories.value = []
  }
}

function openAddModal() {
  selectedArticle.value = null
  showFormModal.value = true
}

function openEditModal(article) {
  selectedArticle.value = article
  showFormModal.value = true
}

function openViewModal(article) {
  viewArticleUuid.value = article.uuid
  showViewModal.value = true
}

function openDeleteModal(article) {
  selectedArticle.value = article
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!selectedArticle.value) return
  deleting.value = true
  try {
    await axiosClient.delete(`/staff/articles/${selectedArticle.value.uuid}`)
    showDeleteModal.value = false
    selectedArticle.value = null
    dashboardStore.addToast(t('articles.deleted') || 'Article deleted successfully', 'success')
    await fetchArticles()
  } catch (err) {
    dashboardStore.addToast(err.response?.data?.message || 'Failed to delete article', 'error')
  } finally {
    deleting.value = false
  }
}

function onFormSaved() {
  fetchArticles()
}

function statusBadgeClass(status) {
  const map = {
    pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  return map[status] || map.draft
}

const visiblePages = computed(() => {
  const total = pagination.value.last_page
  const cur = pagination.value.current_page
  const pages = []
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(() => {
  fetchArticles()
  fetchCategories()
})

watch(() => workspaceStore.currentWorkspaceId, () => {
  currentPage.value = 1
  search.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
  fetchArticles()
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('articles.management') || 'Articles' }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ pagination.total }} {{ t('articles.registered') || 'article(s)' }}</p>
      </div>
      <button v-if="can('update_article')" class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer" @click="openAddModal">
        <span class="material-symbols-outlined text-[18px]">add</span>
        {{ t('articles.newArticle') || 'New Article' }}
      </button>
    </div>

    <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
        <span class="material-symbols-outlined text-lg">error</span>
        <span>{{ error }}</span>
      </div>
      <button class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 underline transition cursor-pointer" @click="fetchArticles">Retry</button>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
        <input
          type="text"
          :placeholder="t('articles.searchPlaceholder') || 'Search articles...'"
          class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          @input="debouncedSearch($event.target.value)"
        />
      </div>
      <select
        :value="statusFilter"
        class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 min-w-[140px]"
        @change="setStatusFilter($event.target.value)"
      >
        <option value="">{{ t('articles.allStatus') || 'All Statuses' }}</option>
        <option value="draft">{{ t('statuses.draft') }}</option>
        <option value="pending_review">{{ t('statuses.pending_review') }}</option>
      </select>
      <select
        :value="categoryFilter"
        class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 min-w-[140px]"
        @change="setCategoryFilter($event.target.value)"
      >
        <option value="">{{ t('articles.allCategories') || 'All Categories' }}</option>
        <option v-for="cat in categories" :key="cat.uuid || cat.id" :value="cat.uuid || cat.id">{{ localField(cat, 'name') }}</option>
      </select>
    </div>

    <div v-if="loading" class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">{{ t('common.name') || 'Title' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.category') || 'Category' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.tags') || 'Tags' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.status') || 'Status' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.views') || 'Views' }}</th>
            <th class="px-5 py-3.5">{{ t('common.date') || 'Date' }}</th>
            <th class="px-5 py-3.5 text-right">{{ t('common.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <tr v-for="i in 5" :key="i" class="animate-pulse">
            <td class="px-5 py-3.5"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700"></div><div class="space-y-1.5"><div class="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded"></div><div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></div></div></td>
            <td class="px-5 py-3.5"><div class="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
            <td class="px-5 py-3.5"><div class="flex gap-1"><div class="h-5 w-12 bg-slate-100 dark:bg-slate-700 rounded-full"></div><div class="h-5 w-12 bg-slate-100 dark:bg-slate-700 rounded-full"></div></div></td>
            <td class="px-5 py-3.5"><div class="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-8 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-7 w-20 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">{{ t('common.name') || 'Title' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.category') || 'Category' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.tags') || 'Tags' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.status') || 'Status' }}</th>
            <th class="px-5 py-3.5">{{ t('articles.views') || 'Views' }}</th>
            <th class="px-5 py-3.5">{{ t('common.date') || 'Date' }}</th>
            <th v-if="can('update_article')" class="px-5 py-3.5 text-right">{{ t('common.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <template v-if="articles.length">
            <tr v-for="article in articles" :key="article.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div v-if="article.cover_image" class="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-2 ring-slate-100 dark:ring-slate-700">
                    <img :src="article.cover_image" :alt="localField(article, 'title')" class="w-full h-full object-cover" />
                  </div>
                  <AvatarInitial v-else :name="localField(article, 'title')" />
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[200px]" :title="localField(article, 'title')">{{ localField(article, 'title') }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <AvatarInitial v-if="article.author?.avatar" :name="localField(article.author, 'name')" class="!w-4 !h-4 !text-[7px]" />
                      <span class="text-xs text-slate-400 dark:text-slate-500">{{ article.author ? localField(article.author, 'name') : '—' }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span v-if="article.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {{ localField(article.category, 'name') }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(tag, i) in (article.tags || []).slice(0, 2)"
                    :key="tag.uuid || tag.id || i"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                  >
                    #{{ localField(tag, 'name') }}
                  </span>
                  <span v-if="(article.tags || []).length > 2" class="text-[10px] text-slate-400 font-semibold self-center">+{{ article.tags.length - 2 }}</span>
                  <span v-if="!article.tags || article.tags.length === 0" class="text-slate-400">—</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" :class="statusBadgeClass(article.status)">
                  {{ t(`statuses.${article.status}`) || article.status }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                {{ article.views || 0 }}
              </td>
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                {{ formatDate(article.created_at) }}
              </td>
              <td v-if="can('update_article')" class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer" :title="t('common.view')" @click="openViewModal(article)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition cursor-pointer" :title="t('common.edit')" @click="openEditModal(article)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer" :title="t('common.delete')" @click="openDeleteModal(article)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="can('update_article') ? 7 : 6" class="px-5 py-12">
              <BaseEmptyState
                v-if="search || statusFilter || categoryFilter"
                icon="article"
                :title="t('articles.noResults') || 'No articles found'"
                description="Try adjusting your search or filters."
              />
              <BaseEmptyState
                v-else
                icon="article"
                :title="t('articles.noArticles') || 'No articles yet'"
                description="Articles will appear here once they are created."
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.last_page > 1 && !loading" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Showing <span class="font-bold text-slate-900 dark:text-white">{{ pagination.from || 0 }}</span>
        to <span class="font-bold text-slate-900 dark:text-white">{{ pagination.to || 0 }}</span>
        of <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span> results
      </p>
      <div class="flex items-center gap-1.5">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page <= 1"
          @click="setPage(pagination.current_page - 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button
          v-for="pg in visiblePages"
          :key="pg"
          class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition"
          :class="pg === pagination.current_page
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="setPage(pg)"
        >{{ pg }}</button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="setPage(pagination.current_page + 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>

    <FacilityArticleModal
      :show="showFormModal"
      :article="selectedArticle"
      @close="showFormModal = false"
      @saved="onFormSaved"
    />
    <FacilityArticleViewModal
      :show="showViewModal"
      :article-uuid="viewArticleUuid"
      @close="showViewModal = false; viewArticleUuid = null"
    />
    <ConfirmModal
      :show="showDeleteModal"
      :title="t('articles.deleteArticle') || 'Delete Article'"
      :message="t('articles.deleteConfirm', { name: localField(selectedArticle, 'title') }) || 'Are you sure you want to delete this article?'"
      :confirm-text="t('common.delete') || 'Delete'"
      @confirm="confirmDelete"
      @close="showDeleteModal = false"
    />
  </div>
</template>
