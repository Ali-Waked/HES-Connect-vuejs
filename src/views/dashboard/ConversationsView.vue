<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFormatDate } from '../../composables/useFormatDate'
import { useConversationManagementStore } from '../../stores/conversationManagementStore'
import BaseTable from '../../components/dashboard/global/BaseTable.vue'
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue'
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue'
import BaseEmptyState from '../../components/dashboard/global/BaseEmptyState.vue'
import BasePagination from '../../components/dashboard/global/BasePagination.vue'
import BaseDialog from '../../components/dashboard/global/BaseDialog.vue'
import BaseLoading from '../../components/dashboard/global/BaseLoading.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { formatDate } = useFormatDate()
const store = useConversationManagementStore()

const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const pageNumber = ref(1)
const rowsPerPage = ref(10)

const showDetailDialog = ref(false)
const selectedConversationId = ref(null)
const activeTab = ref('participants')

const showArchiveConfirm = ref(false)
const showLockConfirm = ref(false)

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'type', label: t('conversationsManagement.type'), width: '160px' },
  { key: 'participants', label: t('conversationsManagement.participants') },
  { key: 'messages_count', label: t('conversationsManagement.messagesCount'), width: '100px', align: 'center' },
  { key: 'last_activity', label: t('conversationsManagement.lastActivity'), width: '180px' },
  { key: 'status', label: t('conversationsManagement.status'), width: '120px' },
  { key: 'created_at', label: t('conversationsManagement.createdAt'), width: '180px' },
  { key: 'actions', label: t('conversationsManagement.actions'), align: 'right', width: '120px' },
]

const typeOptions = [
  { value: 'all', label: t('conversationsManagement.allTypes') },
  { value: 'support', label: t('conversationsManagement.support') },
  { value: 'doctor_patient', label: t('conversationsManagement.doctorPatient') },
]

const statusOptions = [
  { value: 'all', label: t('conversationsManagement.allStatus') },
  { value: 'active', label: t('conversationsManagement.active') },
  { value: 'archived', label: t('conversationsManagement.archived') },
  { value: 'locked', label: t('conversationsManagement.locked') },
]

function parseParams(query) {
  return {
    search: query.search || '',
    type: query.type && query.type !== 'all' ? query.type : '',
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
    typeFilter.value = params.type || 'all'
    statusFilter.value = params.status || 'all'
    pageNumber.value = params.page
    rowsPerPage.value = params.per_page
    store.fetchConversations(params)
    store.fetchConversationStats()
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

function onTypeChange() {
  pushQuery({ type: typeFilter.value, page: undefined })
}

function onStatusChange() {
  pushQuery({ status: statusFilter.value, page: undefined })
}

function onPageChange(page) {
  pushQuery({ page: page > 1 ? page : undefined })
}

function getTypeVariant(type) {
  switch (type) {
    case 'support': return 'info'
    case 'doctor_patient': return 'primary'
    default: return 'neutral'
  }
}

function getStatusVariant(status) {
  switch (status) {
    case 'active': return 'success'
    case 'archived': return 'warning'
    case 'locked': return 'danger'
    default: return 'neutral'
  }
}

function viewConversation(conv) {
  selectedConversationId.value = conv.id
  activeTab.value = 'participants'
  store.resetConversationDetail()
  store.fetchConversationDetails(conv.id)
  showDetailDialog.value = true
}

function confirmArchive() {
  showArchiveConfirm.value = true
}

function confirmLock() {
  showLockConfirm.value = true
}

async function handleArchive() {
  showArchiveConfirm.value = false
  if (selectedConversationId.value) {
    await store.archiveConversation(selectedConversationId.value)
    store.resetConversationDetail()
    showDetailDialog.value = false
  }
}

async function handleLock() {
  showLockConfirm.value = false
  if (selectedConversationId.value) {
    await store.lockConversation(selectedConversationId.value)
    store.resetConversationDetail()
    showDetailDialog.value = false
  }
}

function formatActivity(dateString) {
  if (!dateString) return '—'
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return t('common.justNow')

  const hours = Math.floor(minutes / 60)
  if (hours < 1) return `${minutes}m ago`

  const days = Math.floor(hours / 24)
  if (days < 1) return `${hours}h ago`

  if (days < 7) return `${days}d ago`

  return formatDate(dateString)
}

function resolveLocalizedName(name) {
  if (!name) return '—'
  if (typeof name === 'string') return name
  return name[locale.value] || name.en || name.ar || Object.values(name)[0] || '—'
}

const senderSideMap = computed(() => {
  const map = {}
  let side = 0
  for (const msg of store.messages || []) {
    const senderId = msg.sender?.id || msg.sender?.uuid || msg.sender_id
    if (senderId && !(senderId in map)) {
      map[senderId] = side
      side = side === 0 ? 1 : 0
    }
  }
  return map
})

function isOwnMessage(msg) {
  const senderId = msg.sender?.id || msg.sender?.uuid || msg.sender_id
  return (senderSideMap.value[senderId] ?? 0) === 0
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Error State -->
    <div
      v-if="store.error && !store.loading"
      class="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-center gap-3"
    >
      <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm font-medium text-rose-700 dark:text-rose-300">{{ store.error }}</p>
      <button
        @click="store.fetchConversations(parseParams(route.query))"
        class="ml-auto text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline"
      >
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('conversationsManagement.totalConversations') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ store.stats?.total_conversations ?? '-' }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('conversationsManagement.supportConversations') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ store.stats?.support_conversations ?? '-' }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('conversationsManagement.doctorPatientConversations') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ store.stats?.doctor_patient_conversations ?? '-' }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('conversationsManagement.activeConversations') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ store.stats?.active_conversations ?? '-' }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('conversationsManagement.messagesToday') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ store.stats?.messages_today ?? '-' }}</p>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <!-- Filters -->
      <div class="px-5 pt-5 pb-3">
        <div class="flex flex-col sm:flex-row gap-4">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="t('conversationsManagement.searchPlaceholder')"
            @update:modelValue="onSearch"
          />
          <select
            v-model="typeFilter"
            @change="onTypeChange"
            class="min-w-[160px] p-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition"
          >
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <select
            v-model="statusFilter"
            @change="onStatusChange"
            class="min-w-[160px] p-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <BaseTable :columns="columns" :items="store.conversations" :loading="store.loading">
        <template #cell(id)="{ item }">
          <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">#{{ item.id }}</span>
        </template>

        <template #cell(type)="{ item }">
          <BaseBadge :variant="getTypeVariant(item.type)">
            {{ t('conversationsManagement.' + item.type, item.type) }}
          </BaseBadge>
        </template>

        <template #cell(participants)="{ item }">
          <div class="flex flex-col gap-0.5">
            <span
              v-for="p in (item.participants || []).slice(0, 2)"
              :key="p.id ?? p"
              class="text-sm font-medium text-slate-900 dark:text-white"
            >
              {{ resolveLocalizedName(p.name) }}
            </span>
            <span v-if="(item.participants || []).length > 2" class="text-xs text-slate-400">
              +{{ item.participants.length - 2 }} {{ t('common.more') }}
            </span>
          </div>
        </template>

        <template #cell(messages_count)="{ item }">
          <span class="text-sm font-bold text-slate-900 dark:text-white text-center block">{{ item.messages_count ?? item.messages_count ?? 0 }}</span>
        </template>

        <template #cell(last_activity)="{ item }">
          <span class="text-xs text-slate-500 dark:text-slate-400" :title="item.last_message_at">
            {{ formatActivity(item.last_message_at ?? item.updated_at) }}
          </span>
        </template>

        <template #cell(status)="{ item }">
          <BaseBadge :variant="getStatusVariant(item.status)">
            {{ t('conversationsManagement.' + item.status, item.status) }}
          </BaseBadge>
        </template>

        <template #cell(created_at)="{ item }">
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</span>
        </template>

        <template #cell(actions)="{ item }">
          <div class="flex justify-end gap-1">
            <button
              @click="viewConversation(item)"
              class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition cursor-pointer"
              :title="t('conversationsManagement.view')"
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
            v-if="searchQuery || typeFilter !== 'all' || statusFilter !== 'all'"
            icon="search_off"
            :title="t('conversationsManagement.noResults')"
            :description="t('conversationsManagement.tryAdjusting')"
            @reset="searchQuery = ''; typeFilter = 'all'; statusFilter = 'all'; pushQuery({ search: undefined, type: undefined, status: undefined })"
          />
          <BaseEmptyState
            v-else
            icon="mail"
            :title="t('conversationsManagement.emptyTitle')"
            :description="t('conversationsManagement.emptyDesc')"
          />
        </template>
      </BaseTable>

      <div v-if="store.pagination.total > 0" class="px-5 pb-5">
        <BasePagination
          :currentPage="pageNumber"
          :totalPages="store.pagination.last_page || 1"
          :totalItems="store.pagination.total || 0"
          :itemsPerPage="rowsPerPage"
          @change="onPageChange"
        />
      </div>
    </div>

    <!-- Detail Dialog -->
    <BaseDialog
      :show="showDetailDialog"
      :title="t('conversationsManagement.detailsTitle')"
      size="lg"
      @close="showDetailDialog = false"
    >
      <div v-if="store.conversation" class="space-y-6">
        <!-- Conversation Info -->
        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div class="flex -space-x-3">
            <div
              v-for="(p, i) in (store.conversation.participants || []).slice(0, 3)"
              :key="i"
              class="w-11 h-11 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center text-white font-bold text-sm"
              :class="i === 0 ? 'bg-brand-primary' : i === 1 ? 'bg-emerald-500' : 'bg-amber-500'"
            >
              {{ resolveLocalizedName(p.name).charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-base font-bold text-slate-900 dark:text-white truncate">
              {{ (store.conversation.participants || []).map(p => resolveLocalizedName(p.name)).join(', ') }}
            </h4>
            <div class="flex items-center gap-2 mt-0.5">
              <BaseBadge :variant="getTypeVariant(store.conversation.type)">
                {{ t('conversationsManagement.' + store.conversation.type, store.conversation.type) }}
              </BaseBadge>
              <BaseBadge :variant="getStatusVariant(store.conversation.status)">
                {{ t('conversationsManagement.' + store.conversation.status, store.conversation.status) }}
              </BaseBadge>
              <span class="text-xs text-slate-500">{{ t('conversationsManagement.conversationId') }}: #{{ store.conversation.id }}</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 border-b border-slate-200 dark:border-slate-700">
          <button
            class="px-4 py-2.5 text-sm font-bold transition border-b-2 -mb-px"
            :class="activeTab === 'participants'
              ? 'text-brand-primary border-brand-primary'
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'"
            @click="activeTab = 'participants'"
          >
            {{ t('conversationsManagement.participantsTab') }}
          </button>
          <button
            class="px-4 py-2.5 text-sm font-bold transition border-b-2 -mb-px"
            :class="activeTab === 'messages'
              ? 'text-brand-primary border-brand-primary'
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'"
            @click="activeTab = 'messages'"
          >
            {{ t('conversationsManagement.messagesTab') }}
            <span v-if="store.messages.length" class="ml-1.5 text-xs bg-brand-primary/10 text-brand-primary rounded-full px-2 py-0.5">{{ store.messages.length }}</span>
          </button>
        </div>

        <!-- Participants Tab -->
        <div v-if="activeTab === 'participants'" class="space-y-3">
          <div
            v-for="(p, i) in (store.conversation.participants || [])"
            :key="i"
            class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              :class="i === 0 ? 'bg-brand-primary' : 'bg-slate-400'"
            >
              {{ resolveLocalizedName(p.name).charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveLocalizedName(p.name) }}</p>
              <p v-if="p.email" class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ p.email }}</p>
            </div>
            <BaseBadge v-if="p.role" variant="primary">{{ p.role }}</BaseBadge>
          </div>
          <div v-if="!(store.conversation.participants || []).length" class="text-sm text-slate-500 text-center py-4">
            {{ t('common.noData') }}
          </div>
        </div>

        <!-- Messages Tab -->
        <div v-if="activeTab === 'messages'" class="space-y-1">
          <div v-if="store.messagesLoading" class="py-8">
            <BaseLoading :message="t('conversationsManagement.loadingMessages')" />
          </div>
          <template v-else>
            <div v-if="store.messages.length" class="space-y-4 max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
              <div
                v-for="msg in store.messages"
                :key="msg.id"
                class="flex flex-col"
                :class="isOwnMessage(msg) ? 'items-end' : 'items-start'"
              >
                <div class="flex flex-col gap-1 max-w-[80%]">
                  <div class="flex items-center gap-2" :class="isOwnMessage(msg) ? 'flex-row-reverse' : ''">
                    <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {{ resolveLocalizedName(msg.sender?.name) ?? msg.sender_name ?? 'Unknown' }}
                    </span>
                    <span class="text-[9px] text-slate-400 dark:text-slate-500">
                      {{ formatDate(msg.created_at) }}
                    </span>
                  </div>
                  <div
                    class="p-3 rounded-2xl text-sm"
                    :class="isOwnMessage(msg)
                      ? 'bg-brand-primary text-white rounded-tr-none shadow-md shadow-brand-primary/15'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'"
                  >
                    {{ msg.body ?? msg.message ?? msg.content }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center">
              <p class="text-sm text-slate-500">{{ t('conversationsManagement.noMessages') }}</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Loading state for conversation detail -->
      <div v-else-if="store.messagesLoading" class="py-8">
        <BaseLoading :message="t('common.loading')" />
      </div>

      <template #footer>
        <button
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          @click="showDetailDialog = false"
        >
          {{ t('common.close') }}
        </button>
        <button
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition cursor-pointer"
          :disabled="store.saving"
          @click="confirmArchive()"
        >
          <svg v-if="store.saving" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ t('conversationsManagement.archive') }}
        </button>
        <button
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition cursor-pointer"
          :disabled="store.saving"
          @click="confirmLock()"
        >
          <svg v-if="store.saving" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ t('conversationsManagement.lock') }}
        </button>
      </template>
    </BaseDialog>

    <!-- Archive Confirmation -->
    <Teleport to="body">
      <ConfirmModal
        :show="showArchiveConfirm"
        :title="t('conversationsManagement.archiveConfirmTitle')"
        :message="t('conversationsManagement.archiveConfirmMessage')"
        :confirmText="t('conversationsManagement.archive')"
        :isDanger="false"
        @confirm="handleArchive"
        @close="showArchiveConfirm = false"
      />
    </Teleport>

    <!-- Lock Confirmation -->
    <Teleport to="body">
      <ConfirmModal
        :show="showLockConfirm"
        :title="t('conversationsManagement.lockConfirmTitle')"
        :message="t('conversationsManagement.lockConfirmMessage')"
        :confirmText="t('conversationsManagement.lock')"
        :isDanger="true"
        @confirm="handleLock"
        @close="showLockConfirm = false"
      />
    </Teleport>
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
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
</style>
