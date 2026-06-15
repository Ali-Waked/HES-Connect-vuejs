<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useContactMessages } from '../../../composables/useContactMessages';
import BaseTable from '../global/BaseTable.vue';
import BaseBadge from '../global/BaseBadge.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import BasePagination from '../global/BasePagination.vue';

import MessageDetailDialog from './MessageDetailDialog.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const { messages, loading, saving, stats, pagination, fetchMessages, fetchMessageStats, updateMessageStatus } = useContactMessages();

const searchQuery = ref('');
const statusFilter = ref('all');
const pageNumber = ref(1);
const rowsPerPage = ref(10);

const showDetailDialog = ref(false);
const selectedMessage = ref(null);

const columns = [
  { key: 'name', label: t('contactMessages.name') },
  { key: 'email', label: t('contactMessages.email') },
  { key: 'message', label: t('contactMessages.messagePreview') },
  { key: 'status', label: t('contactMessages.status'), width: '120px' },
  { key: 'created_at', label: t('contactMessages.date'), width: '180px' },
  { key: 'actions', label: t('contactMessages.actions'), align: 'right', width: '120px' }
];

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
    fetchMessages(params)
    fetchMessageStats()
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

function onSearch() {
  pushQuery({ search: searchQuery.value, page: undefined })
}

function onStatusChange() {
  pushQuery({ status: statusFilter.value, page: undefined })
}

function onPageChange(page) {
  pushQuery({ page: page > 1 ? page : undefined })
}

function truncate(text, length = 60) {
  return text?.length > length ? text.substring(0, length) + '...' : text
}

function getStatusVariant(status) {
  switch (status) {
    case 'new': return 'info'
    case 'read': return 'warning'
    case 'replied': return 'success'
    default: return 'neutral'
  }
}

function viewMessage(message) {
  selectedMessage.value = message
  showDetailDialog.value = true
}

function onStatusUpdated() {
  showDetailDialog.value = false
  selectedMessage.value = null
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.contactMessages') }}</h1>
        <p class="text-sm text-slate-500">{{ t('pageTitles.messagesDesc') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('contactMessages.totalMessages') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ stats?.total ?? '-' }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a2 2 0 002 2h8m7-3l-2-2m2 2l-2 2m2-2l2 2m-2-2l2-2" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('contactMessages.new') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ stats?.new ?? '-' }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('contactMessages.read') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ stats?.read ?? '-' }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('contactMessages.replied') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ stats?.replied ?? '-' }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="px-5 pt-5 pb-3">
        <div class="flex flex-col sm:flex-row gap-4">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="t('contactMessages.searchPlaceholder')"
            @update:modelValue="onSearch"
          />
          <select
            v-model="statusFilter"
            @change="onStatusChange"
            class="min-w-[160px] p-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition"
          >
            <option value="all">{{ t('contactMessages.allStatus') }}</option>
            <option value="new">{{ t('statuses.new') }}</option>
            <option value="read">{{ t('statuses.read') }}</option>
            <option value="replied">{{ t('statuses.replied') }}</option>
          </select>
        </div>
      </div>

      <BaseTable :columns="columns" :items="messages" :loading="loading">
        <template #cell(name)="{ item }">
          <span class="text-sm font-medium text-slate-900 dark:text-white">{{ localField(item, 'name') }}</span>
        </template>

        <template #cell(email)="{ item }">
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ item.email }}</span>
        </template>

        <template #cell(message)="{ item }">
          <div class="flex items-center gap-2 max-w-xs">
            <span class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ truncate(localField(item, 'message')) }}</span>
          </div>
        </template>

        <template #cell(status)="{ item }">
          <BaseBadge :variant="getStatusVariant(item.status)">
            {{ t('statuses.' + item.status, item.status) }}
          </BaseBadge>
        </template>

        <template #cell(created_at)="{ item }">
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</span>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex justify-end gap-1">
            <button
              @click="viewMessage(item)"
              class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
              :title="t('contactMessages.view')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </template>

        <template #empty>
          <BaseEmptyState
            v-if="searchQuery || statusFilter !== 'all'"
            icon="search_off"
            :title="t('contactMessages.noResults')"
            :description="t('contactMessages.tryAdjusting')"
            @reset="searchQuery = ''; statusFilter = 'all'; pushQuery({ search: undefined, status: undefined })"
          />
          <BaseEmptyState
            v-else
            :title="t('contactMessages.emptyTitle')"
            :description="t('contactMessages.emptyDesc')"
          />
        </template>
      </BaseTable>

      <div v-if="pagination.total > 0" class="px-5 pb-5">
        <BasePagination
          :currentPage="pageNumber"
          :totalPages="pagination.last_page || 1"
          :totalItems="pagination.total || 0"
          :itemsPerPage="rowsPerPage"
          @change="onPageChange"
        />
      </div>
    </div>

    <MessageDetailDialog
      :show="showDetailDialog"
      :message="selectedMessage"
      :saving="saving"
      @close="showDetailDialog = false"
      @status-updated="onStatusUpdated"
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
