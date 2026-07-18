<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useReviewsStore } from '../../../stores/reviews';
import { useAuthPermissions } from '../../../composables/useAuthPermissions';
import ConfirmModal from '../global/ConfirmModal.vue';
import BasePagination from '../global/BasePagination.vue';
import ReviewDetailDialog from './ReviewDetailDialog.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const store = useReviewsStore();
const { can } = useAuthPermissions();

const searchQuery = ref('');
const ratingFilter = ref('all');
const statusFilter = ref('all');
const dateFrom = ref('');
const dateTo = ref('');
const pageNumber = ref(1);
const rowsPerPage = ref(15);
const selectedReview = ref(null);
const showDetailDialog = ref(false);
const showToggleConfirm = ref(false);
const toggleAction = ref(null);

function parseParams(query) {
  return {
    search: query.search || '',
    rating: query.rating && query.rating !== 'all' ? query.rating : '',
    status: query.status && query.status !== 'all' ? query.status : '',
    date_from: query.date_from || '',
    date_to: query.date_to || '',
    page: parseInt(query.page) || 1,
    per_page: parseInt(query.per_page) || 15,
  }
}

watch(
  () => route.query,
  (query) => {
    const params = parseParams(query)
    searchQuery.value = params.search
    ratingFilter.value = params.rating || 'all'
    statusFilter.value = params.status || 'all'
    dateFrom.value = params.date_from
    dateTo.value = params.date_to
    pageNumber.value = params.page
    rowsPerPage.value = params.per_page
    store.fetchReviews(params)
  },
  { immediate: true }
)

store.fetchStats()

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

function onRatingChange(val) {
  ratingFilter.value = val
  pushQuery({ rating: val, page: undefined })
}

function onStatusChange(val) {
  statusFilter.value = val
  pushQuery({ status: val, page: undefined })
}

function onDateFromChange(val) {
  dateFrom.value = val
  pushQuery({ date_from: val, page: undefined })
}

function onDateToChange(val) {
  dateTo.value = val
  pushQuery({ date_to: val, page: undefined })
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
  pushQuery({
    search: undefined, rating: undefined,
    status: undefined, date_from: undefined, date_to: undefined, page: undefined
  })
}

function viewReview(review) {
  selectedReview.value = review
  showDetailDialog.value = true
}

function confirmToggleVisibility(review) {
  if (!can('reviews.manage')) return
  selectedReview.value = review
  toggleAction.value = review.status === 'hidden' ? 'show' : 'hide'
  showToggleConfirm.value = true
}

async function handleToggleVisibility() {
  if (!selectedReview.value) return
  const id = selectedReview.value.id
  if (toggleAction.value === 'hide') {
    await store.hideReview(id)
  } else {
    await store.showReview(id)
  }
  showToggleConfirm.value = false
  selectedReview.value = null
}

function confirmDelete(review) {
  if (!can('reviews.manage')) return
  selectedReview.value = review
  showDeleteConfirm.value = true
}

const showDeleteConfirm = ref(false)

async function handleDelete() {
  if (selectedReview.value) {
    const id = selectedReview.value.id
    await store.deleteReview(id)
    showDeleteConfirm.value = false
    selectedReview.value = null
  }
}

const statusBadge = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  hidden: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
}

function statusClass(status) {
  return statusBadge[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

function statusLabel(status) {
  return t(`reviews.${status}`) || status || '—'
}

function isVisible(status) {
  return status === 'approved'
}

function hasAvatar(review) {
  return review.user?.avatar
}

function getUserInitials(review) {
  const name = localField(review.user, 'name') || review.user?.name || review.user?.email || '?'
  return name.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="space-y-4">
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <!-- Filters -->
      <div class="px-5 pt-5 pb-3">
        <div class="flex flex-col lg:flex-row gap-3 flex-wrap">
          <div class="relative flex-grow min-w-[180px]">
            <svg class="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              class="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition"
              :placeholder="t('reviews.searchPlaceholder') || 'Search reviews...'"
              :value="searchQuery"
              @input="onSearchInput($event.target.value)"
            />
          </div>
          <select
            class="min-w-[120px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none transition"
            :value="ratingFilter" @change="onRatingChange($event.target.value)"
          >
            <option value="all">{{ t('reviews.allRatings') || 'All Ratings' }}</option>
            <option value="5">5 {{ t('reviews.stars', { n: 5 }).replace(/^\d+\s/, '') }}</option>
            <option value="4">4 {{ t('reviews.stars', { n: 4 }).replace(/^\d+\s/, '') }}</option>
            <option value="3">3 {{ t('reviews.stars', { n: 3 }).replace(/^\d+\s/, '') }}</option>
            <option value="2">2 {{ t('reviews.stars', { n: 2 }).replace(/^\d+\s/, '') }}</option>
            <option value="1">1 {{ t('reviews.star', { n: 1 }).replace(/^\d+\s/, '') }}</option>
          </select>
          <select
            class="min-w-[130px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none transition"
            :value="statusFilter" @change="onStatusChange($event.target.value)"
          >
            <option value="all">{{ t('reviews.allStatus') || 'All Status' }}</option>
            <option value="pending">{{ t('reviews.pending') || 'Pending' }}</option>
            <option value="approved">{{ t('reviews.approved') || 'Approved' }}</option>
            <option value="rejected">{{ t('reviews.rejected') || 'Rejected' }}</option>
            <option value="hidden">{{ t('reviews.hidden') }}</option>
          </select>
          <input
            type="date"
            class="min-w-[140px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition"
            :value="dateFrom"
            @change="onDateFromChange($event.target.value)"
            :title="t('reviews.dateFrom') || 'From'"
          />
          <input
            type="date"
            class="min-w-[140px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none transition"
            :value="dateTo"
            @change="onDateToChange($event.target.value)"
            :title="t('reviews.dateTo') || 'To'"
          />
          <select
            class="min-w-[100px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none transition"
            :value="rowsPerPage" @change="onPerPageChange($event.target.value)"
          >
            <option value="15">15 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="store.error" class="mx-5 mb-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ store.error }}</span>
        </div>
        <button
          @click="store.fetchReviews(parseParams(route.query)); store.fetchStats()"
          class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline transition"
        >
          {{ t('reviews.retry') }}
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="store.loading" class="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <svg class="w-8 h-8 text-brand-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ t('reviews.loading') }}</p>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left rtl:text-right">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[18%]">{{ t('reviews.user') || 'User' }}</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%]">{{ t('reviews.rating') }}</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[28%]">{{ t('reviews.comment') }}</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[16%]">{{ t('reviews.status') || 'Status' }}</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[12%]">{{ t('reviews.createdAt') }}</th>
              <th class="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right rtl:text-left w-[16%]">{{ t('reviews.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="store.reviews.length === 0">
              <td colspan="6" class="px-5 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.951.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('reviews.noResults') }}</p>
                  <button class="text-xs font-semibold text-brand-primary hover:underline cursor-pointer" @click="resetFilters">{{ t('common.resetFilters') || 'Reset Filters' }}</button>
                </div>
              </td>
            </tr>
            <tr v-for="review in store.reviews" :key="review.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div v-if="hasAvatar(review)" class="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700">
                    <img :src="review.user.avatar" :alt="localField(review.user, 'name')" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-700">
                    <span class="text-xs font-bold text-brand-primary">{{ getUserInitials(review) }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{{ localField(review.user, 'name') || '—' }}</p>
                    <p v-if="review.user?.email" class="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">{{ review.user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1.5">
                  <div class="flex text-amber-400">
                    <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ review.rating }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-slate-600 dark:text-slate-400 italic truncate max-w-[200px]">"{{ (review.comment || '').length > 60 ? (review.comment || '').substring(0, 60) + '...' : (review.comment || '—') }}"</span>
                  <button
                    v-if="review.comment?.length > 60"
                    class="shrink-0 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                    @click="viewReview(review)"
                  >{{ t('reviews.viewDetails') }}</button>
                </div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(review.status)">
                    {{ statusLabel(review.status) }}
                  </span>
                  <span v-if="review.is_featured" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {{ t('reviews.featured') || 'Featured' }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{{ formatDate(review.created_at) }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right rtl:text-left">
                <div class="flex justify-end rtl:justify-start gap-1">
                  <button
                    v-permission="'reviews.view'"
                    class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    :title="t('reviews.viewDetails')"
                    @click="viewReview(review)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    v-permission="'reviews.manage'"
                    class="p-1.5 rounded-lg transition cursor-pointer"
                    :class="isVisible(review.status)
                      ? 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                      : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
                    :title="isVisible(review.status) ? t('reviews.hideAction') : t('reviews.showAction')"
                    :disabled="store.actionLoading"
                    @click="confirmToggleVisibility(review)"
                  >
                    <svg v-if="isVisible(review.status)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    v-permission="'reviews.manage'"
                    class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition cursor-pointer"
                    :title="t('reviews.deleteAction')"
                    :disabled="store.actionLoading"
                    @click="confirmDelete(review)"
                  >
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

    <!-- Pagination -->
    <BasePagination
      v-if="store.pagination.total > 0"
      :currentPage="pageNumber"
      :totalPages="store.pagination.last_page || 1"
      :totalItems="store.pagination.total || 0"
      :itemsPerPage="rowsPerPage"
      @change="onPageChange"
    />

    <ReviewDetailDialog
      :show="showDetailDialog"
      :review="selectedReview"
      @close="showDetailDialog = false"
    />

    <ConfirmModal
      :show="showToggleConfirm"
      :title="toggleAction === 'hide' ? t('reviews.hideTitle') || 'Hide Review' : t('reviews.showTitle') || 'Show Review'"
      :message="toggleAction === 'hide'
        ? t('reviews.hideConfirm') || 'Are you sure you want to hide this review?'
        : t('reviews.showConfirm') || 'Are you sure you want to show this review?'"
      :confirm-text="toggleAction === 'hide' ? t('reviews.hideAction') : t('reviews.showAction')"
      @confirm="handleToggleVisibility"
      @close="showToggleConfirm = false"
    />

    <ConfirmModal
      :show="showDeleteConfirm"
      :title="t('reviews.deleteTitle')"
      :message="t('reviews.deleteConfirm', { user: localField(selectedReview?.user, 'name') || selectedReview?.user?.name || '' })"
      :confirm-text="t('common.delete')"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
