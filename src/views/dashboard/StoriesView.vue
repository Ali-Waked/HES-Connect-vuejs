<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useDashboardStories } from '@/composables/useDashboardStories'
import { useCategories } from '@/composables/useCategories'
import { resolveTranslatedValue } from '@/utils/locale'
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue'
import BaseTable from '@/components/dashboard/global/BaseTable.vue'
import BasePagination from '@/components/dashboard/global/BasePagination.vue'
import BaseSearch from '@/components/dashboard/global/BaseSearch.vue'
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'
import BaseBadge from '@/components/dashboard/global/BaseBadge.vue'
import CategoryBadge from '@/components/shared/CategoryBadge.vue'
import ConfirmModal from '@/components/dashboard/global/ConfirmModal.vue'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { can } = useAuthPermissions()
const route = useRoute()
const router = useRouter()

const {
  stories, loading, error, saving, pagination, stats, statsLoading,
  trashedStories, trashLoading, trashError, trashPagination,
  fetchStories, fetchTrashStories, fetchStoryStats, fetchStory,
  updateStoryStatus, deleteStory, restoreStory, forceDeleteStory,
} = useDashboardStories()

const { categories, fetchCategories } = useCategories()
fetchCategories({ type: 'story', per_page: 100 })

const activeTab = ref('active')

const searchQuery = ref('')
const statusFilter = ref('')
const fundraisingFilter = ref('')
const categoryFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const perPage = ref(15)

const selectedStory = ref(null)
const showDetailModal = ref(false)
const confirmApprove = ref(false)
const confirmReject = ref(false)
const confirmDelete = ref(false)
const confirmForceDelete = ref(false)
const confirmRestore = ref(false)
const actionTarget = ref(null)

const statusOptions = ['pending', 'approved', 'rejected']

function parseParams(query) {
  return {
    search: query.search || '',
    status: query.status || '',
    fundraising: query.fundraising || '',
    category: query.category || '',
    date_from: query.date_from || '',
    date_to: query.date_to || '',
    page: parseInt(query.page) || 1,
    per_page: parseInt(query.per_page) || 15,
  }
}

function pushQuery(updates) {
  const query = { ...route.query }
  for (const [key, val] of Object.entries(updates)) {
    if (val === '' || val === undefined || val === null) {
      delete query[key]
    } else {
      query[key] = String(val)
    }
  }
  router.push({ query })
}

const filterParams = computed(() => {
  const params = { page: currentPage.value, per_page: perPage.value }
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  if (statusFilter.value) params.status = statusFilter.value
  if (fundraisingFilter.value === 'yes') params.is_fundraising = 1
  if (fundraisingFilter.value === 'no') params.is_fundraising = 0
  if (categoryFilter.value) params.category_id = categoryFilter.value
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  return params
})

const hasActiveFilters = computed(() => searchQuery.value || statusFilter.value || fundraisingFilter.value || categoryFilter.value || dateFrom.value || dateTo.value)

watch(
  () => route.query,
  (query) => {
    const p = parseParams(query)
    searchQuery.value = p.search
    statusFilter.value = p.status
    fundraisingFilter.value = p.fundraising
    categoryFilter.value = p.category
    dateFrom.value = p.date_from
    dateTo.value = p.date_to
    currentPage.value = p.page
    perPage.value = p.per_page
    if (activeTab.value === 'trash') {
      fetchTrashStories(filterParams.value)
    } else {
      fetchStories(filterParams.value)
    }
  },
  { immediate: true }
)

function statusVariant(s) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[s] || 'neutral'
}

function statusLabel(s) {
  if (!s) return ''
  const key = 'stories.' + s
  const translated = t(key)
  if (translated && translated !== key) return translated
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function safeName(val) {
  return resolveTranslatedValue(val) || '—'
}

function formatDate(val) {
  if (!val) return '—'
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(val.replace(' ', 'T')).toLocaleDateString(loc, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return val
  }
}

function formatCurrency(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString()
}

let searchTimeout = null
function onSearchInput(val) {
  searchQuery.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { pushQuery({ search: val || undefined, page: undefined }) }, 400)
}

function onFilterChange() {
  pushQuery({
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
    fundraising: fundraisingFilter.value || undefined,
    category: categoryFilter.value || undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    page: undefined,
  })
}

function changePage(page) {
  pushQuery({ page: page > 1 ? page : undefined })
}

function clearFilters() {
  pushQuery({ search: undefined, status: undefined, fundraising: undefined, category: undefined, date_from: undefined, date_to: undefined, page: undefined })
}

function switchTab(tab) {
  activeTab.value = tab
  clearFilters()
}

function viewDetails(story) {
  selectedStory.value = story
  showDetailModal.value = true
}

function closeDetail() {
  showDetailModal.value = false
  selectedStory.value = null
}

function requestApprove(story) {
  actionTarget.value = story
  confirmApprove.value = true
}

function requestReject(story) {
  actionTarget.value = story
  confirmReject.value = true
}

function requestDelete(story) {
  actionTarget.value = story
  confirmDelete.value = true
}

function requestForceDelete(story) {
  actionTarget.value = story
  confirmForceDelete.value = true
}

function requestRestore(story) {
  actionTarget.value = story
  confirmRestore.value = true
}

async function handleApprove() {
  if (!actionTarget.value) return
  await updateStoryStatus(actionTarget.value.id || actionTarget.value.uuid, 'approved')
  confirmApprove.value = false
  actionTarget.value = null
}

async function handleReject() {
  if (!actionTarget.value) return
  await updateStoryStatus(actionTarget.value.id || actionTarget.value.uuid, 'rejected')
  confirmReject.value = false
  actionTarget.value = null
}

async function handleDelete() {
  if (!actionTarget.value) return
  await deleteStory(actionTarget.value.id || actionTarget.value.uuid)
  confirmDelete.value = false
  actionTarget.value = null
}

async function handleForceDelete() {
  if (!actionTarget.value) return
  await forceDeleteStory(actionTarget.value.id || actionTarget.value.uuid)
  confirmForceDelete.value = false
  actionTarget.value = null
}

async function handleRestore() {
  if (!actionTarget.value) return
  await restoreStory(actionTarget.value.id || actionTarget.value.uuid)
  confirmRestore.value = false
  actionTarget.value = null
}

function getStoryId(story) {
  return story.uuid ? story.uuid.split('-')[0] : (story.id || '—')
}

function storyTitle(story) {
  if (story.title) return safeName(story.title)
  return safeName(story.content) || `#${getStoryId(story)}`
}

function hasFundraising(story) {
  return story.is_fundraising || (story.fundraising && story.fundraising.is_active)
}

function getTargetAmount(story) {
  if (story.target_amount != null) return story.target_amount
  if (story.fundraising && story.fundraising.target_amount != null) return story.fundraising.target_amount
  return null
}

function getCollectedAmount(story) {
  if (story.collected_amount != null) return story.collected_amount
  if (story.fundraising && story.fundraising.collected_amount != null) return story.fundraising.collected_amount
  return null
}

function getStoryContent(story, lang) {
  if (story.content && typeof story.content === 'object') return story.content[lang] || ''
  return ''
}

function storyCategory(story) {
  if (!story.category_id && !story.category) return null
  const catId = story.category_id || story.category?.id || story.category?.uuid
  if (!catId) return null
  return categories.value.find(c => (c.uuid || c.id) == catId) || (story.category || null)
}

const statsCards = computed(() => [
  { title: t('stories.totalStories'), value: (stats.value?.total || stats.value?.all || 0).toLocaleString(), icon: 'auto_stories', color: 'primary', subtitle: t('stories.totalDesc') },
  { title: t('stories.pendingStories'), value: (stats.value?.pending || 0).toLocaleString(), icon: 'hourglass_empty', color: 'warning', subtitle: t('stories.pendingDesc') },
  { title: t('stories.approvedStories'), value: (stats.value?.approved || 0).toLocaleString(), icon: 'check_circle', color: 'success', subtitle: t('stories.approvedDesc') },
  { title: t('stories.rejectedStories'), value: (stats.value?.rejected || 0).toLocaleString(), icon: 'cancel', color: 'danger', subtitle: t('stories.rejectedDesc') },
])

const activeColumns = computed(() => [
  { key: 'id', label: t('stories.id'), width: '100px' },
  { key: 'patient', label: t('stories.patient') },
  { key: 'title', label: t('stories.titleLabel') },
  { key: 'category', label: t('stories.category'), width: '130px' },
  { key: 'status', label: t('stories.status'), width: '110px' },
  { key: 'fundraising', label: t('stories.fundraising'), width: '110px', align: 'center' },
  { key: 'target', label: t('stories.targetAmount'), width: '130px', align: 'right' },
  { key: 'collected', label: t('stories.collectedAmount'), width: '130px', align: 'right' },
  { key: 'created_at', label: t('stories.createdAt'), width: '130px' },
  { key: 'actions', label: t('stories.actions'), width: '160px', align: 'right' },
])

const trashColumns = computed(() => [
  { key: 'id', label: t('stories.id'), width: '100px' },
  { key: 'patient', label: t('stories.patient') },
  { key: 'title', label: t('stories.titleLabel') },
  { key: 'status', label: t('stories.status'), width: '110px' },
  { key: 'deleted_at', label: t('stories.deletedAt'), width: '130px' },
  { key: 'actions', label: t('stories.actions'), width: '180px', align: 'right' },
])

onMounted(() => {
  fetchStoryStats()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('stories.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('stories.description') }}</p>
      </div>
    </div>

    <div v-if="statsLoading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse">
        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 mb-4"></div>
        <div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded mb-2"></div>
        <div class="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatisticsCard v-for="card in statsCards" :key="card.title" v-bind="card" />
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 sm:p-6">
      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
        <button
          class="px-4 py-2 text-sm font-bold rounded-lg transition cursor-pointer"
          :class="activeTab === 'active' ? 'bg-brand-primary text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="switchTab('active')"
        >{{ t('stories.activeTab') }}</button>
        <button
          v-if="can('delete_story')"
          class="px-4 py-2 text-sm font-bold rounded-lg transition cursor-pointer"
          :class="activeTab === 'trash' ? 'bg-brand-primary text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="switchTab('trash')"
        >
          {{ t('stories.trashTab') }}
          <span v-if="stats?.trashed_stories" class="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full" :class="activeTab === 'trash' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'">{{ stats.trashed_stories }}</span>
        </button>
      </div>

      <!-- Filters (only for active tab) -->
      <div v-if="activeTab === 'active'" class="flex flex-col lg:flex-row gap-3 mb-4">
        <BaseSearch v-model="searchQuery" :placeholder="t('stories.searchPlaceholder')" @update:model-value="onSearchInput" />
        <select v-model="statusFilter" class="min-w-[150px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition cursor-pointer" @change="onFilterChange">
          <option value="">{{ t('stories.allStatuses') }}</option>
          <option v-for="s in statusOptions" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </select>
        <select v-model="fundraisingFilter" class="min-w-[150px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition cursor-pointer" @change="onFilterChange">
          <option value="">{{ t('common.all') || 'All' }}</option>
          <option value="yes">{{ t('common.yes') || 'Yes' }}</option>
          <option value="no">{{ t('common.no') || 'No' }}</option>
        </select>
        <select v-model="categoryFilter" class="min-w-[160px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition cursor-pointer" @change="onFilterChange">
          <option value="">{{ t('stories.allCategories') }}</option>
          <option v-for="cat in categories.filter(c => c.type === 'story')" :key="cat.uuid || cat.id" :value="cat.uuid || cat.id">{{ resolveTranslatedValue(cat.name) }}</option>
        </select>
        <input v-model="dateFrom" type="date" class="min-w-[150px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition" @change="onFilterChange" />
        <input v-model="dateTo" type="date" class="min-w-[150px] px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition" @change="onFilterChange" />
      </div>

      <!-- Active Stories Table -->
      <template v-if="activeTab === 'active'">
        <BaseTable v-if="!error" :columns="activeColumns" :items="stories" :loading="loading">
          <template #cell(id)="{ item }">
            <code class="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 px-2 py-0.5 rounded">{{ getStoryId(item) }}</code>
          </template>
          <template #cell(patient)="{ item }">
            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ safeName(item.patient?.name) }}</span>
          </template>
          <template #cell(title)="{ item }">
            <span class="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{{ storyTitle(item) }}</span>
          </template>
          <template #cell(category)="{ item }">
            <CategoryBadge :category="storyCategory(item)" size="xs" />
          </template>
          <template #cell(status)="{ item }">
            <BaseBadge :variant="statusVariant(item.status)">{{ statusLabel(item.status) }}</BaseBadge>
          </template>
          <template #cell(fundraising)="{ item }">
            <span v-if="hasFundraising(item)" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
              {{ t('common.yes') || 'Yes' }}
            </span>
            <span v-else class="text-xs text-slate-400 dark:text-slate-500">{{ t('common.no') || 'No' }}</span>
          </template>
          <template #cell(target)="{ item }">
            <span v-if="hasFundraising(item) && getTargetAmount(item) != null" class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(getTargetAmount(item)) }}</span>
            <span v-else class="text-sm text-slate-400 dark:text-slate-500">—</span>
          </template>
          <template #cell(collected)="{ item }">
            <span v-if="hasFundraising(item) && getCollectedAmount(item) != null" class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(getCollectedAmount(item)) }}</span>
            <span v-else class="text-sm text-slate-400 dark:text-slate-500">—</span>
          </template>
          <template #cell(created_at)="{ item }">
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(item.created_at) }}</span>
          </template>
          <template #cell(actions)="{ item }">
            <div class="flex items-center justify-end gap-1">
              <button class="px-2.5 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 rounded-lg transition cursor-pointer" @click="viewDetails(item)">{{ t('stories.view') }}</button>
              <button v-if="item.status === 'pending'" class="px-2.5 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition cursor-pointer" @click="requestApprove(item)">{{ t('stories.approve') }}</button>
              <button v-if="item.status === 'pending'" class="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition cursor-pointer" @click="requestReject(item)">{{ t('stories.reject') }}</button>
              <button class="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer" @click="requestDelete(item)">{{ t('stories.delete') }}</button>
            </div>
          </template>
          <template #empty>
            <BaseEmptyState
              v-if="hasActiveFilters"
              icon="search_off"
              :title="t('stories.noResults')"
              :description="t('stories.noResultsDesc')"
              @reset="clearFilters"
            />
            <BaseEmptyState
              v-else
              icon="auto_stories"
              :title="t('stories.noStories')"
              :description="t('stories.noStoriesDesc')"
            />
          </template>
        </BaseTable>

        <div v-if="error" class="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 text-center">
          <div class="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
          </div>
          <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('stories.failedToLoad') }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
          <button class="px-5 py-2.5 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20 cursor-pointer" @click="doFetch">{{ t('stories.tryAgain') }}</button>
        </div>

        <BasePagination
          v-if="pagination.total && pagination.total > (pagination.per_page || perPage)"
          :current-page="pagination.current_page || currentPage"
          :total-pages="pagination.last_page || 1"
          :total-items="pagination.total || 0"
          :items-per-page="pagination.per_page || perPage"
          @change="changePage"
        />
      </template>

      <!-- Trash Table -->
      <template v-if="activeTab === 'trash' && can('delete_story')">
        <BaseTable v-if="!trashError" :columns="trashColumns" :items="trashedStories" :loading="trashLoading">
          <template #cell(id)="{ item }">
            <code class="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 px-2 py-0.5 rounded">{{ getStoryId(item) }}</code>
          </template>
          <template #cell(patient)="{ item }">
            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ safeName(item.patient?.name) }}</span>
          </template>
          <template #cell(title)="{ item }">
            <span class="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{{ storyTitle(item) }}</span>
          </template>
          <template #cell(status)="{ item }">
            <BaseBadge :variant="statusVariant(item.status)">{{ statusLabel(item.status) }}</BaseBadge>
          </template>
          <template #cell(deleted_at)="{ item }">
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(item.deleted_at) }}</span>
          </template>
          <template #cell(actions)="{ item }">
            <div class="flex items-center justify-end gap-1">
              <button class="px-2.5 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 rounded-lg transition cursor-pointer" @click="viewDetails(item)">{{ t('stories.view') }}</button>
              <button
                class="px-2.5 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="saving"
                @click="requestRestore(item)"
              >{{ t('stories.restore') }}</button>
              <button
                class="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="saving"
                @click="requestForceDelete(item)"
              >{{ t('stories.forceDelete') }}</button>
            </div>
          </template>
          <template #empty>
            <BaseEmptyState
              icon="delete_sweep"
              :title="t('stories.noTrashedStories')"
              :description="t('stories.noTrashedStoriesDesc')"
            />
          </template>
        </BaseTable>

        <div v-if="trashError" class="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 text-center">
          <div class="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
          </div>
          <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('stories.failedToLoad') }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ trashError }}</p>
          <button class="px-5 py-2.5 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20 cursor-pointer" @click="doFetch">{{ t('stories.tryAgain') }}</button>
        </div>

        <BasePagination
          v-if="trashPagination.total && trashPagination.total > (trashPagination.per_page || perPage)"
          :current-page="trashPagination.current_page || 1"
          :total-pages="trashPagination.last_page || 1"
          :total-items="trashPagination.total || 0"
          :items-per-page="trashPagination.per_page || perPage"
          @change="changePage"
        />
      </template>
    </div>

    <BaseDialog :show="showDetailModal" :title="t('stories.details')" size="lg" @close="closeDetail">
      <div v-if="selectedStory" class="space-y-5">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg">
              {{ (safeName(selectedStory.patient?.name))[0] || '?' }}
            </div>
            <div>
              <h4 class="text-lg font-bold text-slate-900 dark:text-white">{{ safeName(selectedStory.patient?.name) }}</h4>
              <div class="flex items-center gap-2 mt-1">
                <BaseBadge :variant="statusVariant(selectedStory.status)">{{ statusLabel(selectedStory.status) }}</BaseBadge>
                <CategoryBadge :category="storyCategory(selectedStory)" size="xs" />
              </div>
            </div>
          </div>
          <code class="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">{{ getStoryId(selectedStory) }}</code>
        </div>

        <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
          <div>
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.titleLabel') }}</span>
            <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ storyTitle(selectedStory) }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <h5 class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ t('stories.storyContent') }}</h5>
          <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.storyContentEn') }}</span>
              <div v-if="getStoryContent(selectedStory, 'en')" class="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed prose prose-sm max-w-none" v-html="getStoryContent(selectedStory, 'en')"></div>
              <p v-else class="text-sm text-slate-400 italic mt-1">{{ t('stories.noContent') }}</p>
            </div>
            <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.storyContentAr') }}</span>
              <div v-if="getStoryContent(selectedStory, 'ar')" class="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed prose prose-sm max-w-none text-right" dir="rtl" v-html="getStoryContent(selectedStory, 'ar')"></div>
              <p v-else class="text-sm text-slate-400 italic mt-1">{{ t('stories.noContent') }}</p>
            </div>
          </div>
        </div>

        <div v-if="hasFundraising(selectedStory)" class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
          <h5 class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ t('stories.fundraisingGoal') }}</h5>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.targetAmountLabel') }}</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{{ formatCurrency(getTargetAmount(selectedStory)) }}</p>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.collectedAmountLabel') }}</span>
              <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{{ formatCurrency(getCollectedAmount(selectedStory)) }}</p>
            </div>
          </div>
          <div v-if="getTargetAmount(selectedStory) > 0" class="mt-2">
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: Math.min(100, (getCollectedAmount(selectedStory) || 0) / getTargetAmount(selectedStory) * 100) + '%' }"
              ></div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ Math.round((getCollectedAmount(selectedStory) || 0) / getTargetAmount(selectedStory) * 100) }}% {{ t('stories.raised') }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.createdAt') }}</span>
            <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ formatDate(selectedStory.created_at) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition cursor-pointer"
            @click="closeDetail"
          >
            {{ t('common.close') || 'Close' }}
          </button>
        </div>
      </template>
    </BaseDialog>

    <ConfirmModal
      :show="confirmApprove"
      :title="t('stories.confirmApprove')"
      :message="t('stories.confirmApproveMsg')"
      :confirm-text="t('stories.approve')"
      :is-danger="false"
      @confirm="handleApprove"
      @close="confirmApprove = false; actionTarget = null"
    />

    <ConfirmModal
      :show="confirmReject"
      :title="t('stories.confirmReject')"
      :message="t('stories.confirmRejectMsg')"
      :confirm-text="t('stories.reject')"
      @confirm="handleReject"
      @close="confirmReject = false; actionTarget = null"
    />

    <ConfirmModal
      :show="confirmDelete"
      :title="t('stories.confirmDelete')"
      :message="t('stories.confirmDeleteMsg')"
      :confirm-text="t('stories.delete')"
      @confirm="handleDelete"
      @close="confirmDelete = false; actionTarget = null"
    />

    <ConfirmModal
      :show="confirmRestore"
      :title="t('stories.confirmRestore')"
      :message="t('stories.confirmRestoreMsg')"
      :confirm-text="t('stories.restore')"
      :is-danger="false"
      @confirm="handleRestore"
      @close="confirmRestore = false; actionTarget = null"
    />

    <ConfirmModal
      :show="confirmForceDelete"
      :title="t('stories.confirmForceDelete')"
      :message="t('stories.confirmForceDeleteMsg')"
      :confirm-text="t('stories.forceDelete')"
      @confirm="handleForceDelete"
      @close="confirmForceDelete = false; actionTarget = null"
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
