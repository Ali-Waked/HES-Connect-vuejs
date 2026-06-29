<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '../../../stores/notifications'
import InfiniteScroll from '../global/InfiniteScroll.vue'
import BaseBadge from '../global/BaseBadge.vue'
import ConfirmModal from '../global/ConfirmModal.vue'

const router = useRouter()
const { t } = useI18n()
const store = useNotificationsStore()

const unreadOnly = ref(false)
const selectedType = ref(null)
const deleting = ref(null)
const pendingDelete = ref(null)
const typeOptions = [
  { value: null, label: () => t('common.all') || 'All' },
  { value: 'story', label: 'Stories' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'appointment', label: 'Appointments' },
  { value: 'prescription', label: 'Prescriptions' },
  { value: 'review', label: 'Reviews' },
  { value: 'article', label: 'Articles' },
  { value: 'user', label: 'Users' },
  { value: 'facility', label: 'Facilities' },
  { value: 'system', label: 'System' },
]

const displayed = computed(() => {
  let result = store.items
  if (unreadOnly.value) {
    result = result.filter(n => !n.read_at)
  }
  if (selectedType.value) {
    result = result.filter(n => n.type === selectedType.value)
  }
  return result
})

const grouped = computed(() => {
  const groups = {}
  for (const n of displayed.value) {
    const type = n.type || 'system'
    if (!groups[type]) groups[type] = []
    groups[type].push(n)
  }
  return groups
})

function onFilterTypeChange(e) {
  selectedType.value = e.target.value || null
}

function toggleUnreadOnly() {
  unreadOnly.value = !unreadOnly.value
}

function handleMarkRead(n) {
  if (!n.read_at) store.markAsRead(n.uuid)
}

function handleDelete(n) {
  pendingDelete.value = n
}

function confirmDelete() {
  if (!pendingDelete.value) return
  const n = pendingDelete.value
  pendingDelete.value = null
  deleting.value = n.uuid || n.id
  store.deleteNotification(n.uuid || n.id).finally(() => {
    deleting.value = null
  })
}

function cancelDelete() {
  pendingDelete.value = null
}

function handleMarkAllRead() {
  store.markAllAsRead()
}

function handleItemClick(n) {
  if (n.action_url) {
    router.push(n.action_url)
  }
  if (!n.read_at) store.markAsRead(n.uuid)
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  if (diff < 60000) return t('common.justNow') || 'Just now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('notifications.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ store.unreadCount > 0 ? `${store.unreadCount} ${t('notifications.unread')}` : t('notifications.allCaughtUp') }}
          &middot; {{ store.pagination.total }} {{ t('common.total') }}
        </p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <select
          class="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
          :value="selectedType"
          @change="onFilterTypeChange"
        >
          <option
            v-for="opt in typeOptions"
            :key="opt.value || 'all'"
            :value="opt.value"
          >{{ typeof opt.label === 'function' ? opt.label() : opt.label }}</option>
        </select>

        <button
          class="inline-flex items-center gap-2 py-2 px-3.5 rounded-lg border text-sm font-semibold transition cursor-pointer"
          :class="unreadOnly
            ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/15'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'"
          @click="toggleUnreadOnly"
        >
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          {{ t('notifications.unreadOnly') }}
          <span v-if="unreadOnly && store.unreadCount" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold">{{ store.unreadCount }}</span>
        </button>

        <button
          v-if="store.hasUnread"
          class="inline-flex items-center gap-2 py-2 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          @click="handleMarkAllRead"
        >
          <svg class="w-4 h-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ t('notifications.markAllRead') }}
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div v-if="store.loading && store.items.length === 0" class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="i in 6" :key="i" class="flex items-start gap-4 px-6 py-4 animate-pulse">
          <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0 mt-0.5"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
            <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>

      <div v-else-if="displayed.length === 0" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {{ unreadOnly ? t('notifications.noUnread') : t('notifications.allCaughtUp') }}
        </p>
        <button
          v-if="unreadOnly"
          class="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition"
          @click="unreadOnly = false"
        >{{ t('notifications.showAll') }}</button>
      </div>

      <InfiniteScroll
        v-else
        :loading="store.loadingMore"
        :has-more="store.pagination.page < store.pagination.lastPage"
        @load-more="store.fetchMore()"
      >
        <template v-for="(notifs, type) in grouped" :key="type">
          <div class="px-6 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {{ type }}
          </div>
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            <div
              v-for="n in notifs"
              :key="n.id"
              class="flex items-start gap-4 px-6 py-4 transition-colors group cursor-pointer"
              :class="[
                n.read_at ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40' : 'bg-blue-50/30 dark:bg-blue-900/5 hover:bg-blue-50/60 dark:hover:bg-blue-900/15',
                n.action_url ? 'cursor-pointer' : ''
              ]"
              @click="handleItemClick(n)"
            >
              <div class="flex-shrink-0 mt-0.5">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="store.getConfig(n.type).bg">
                  <svg
                    class="w-5 h-5"
                    :class="store.getConfig(n.type).icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24"
                    stroke-width="1.8" stroke="currentColor"
                    v-html="store.getConfig(n.type).svg"
                  ></svg>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white leading-snug">{{ n.title }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ n.message }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span class="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium">{{ timeAgo(n.created_at) }}</span>
                    <span v-if="!n.read_at" class="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0"></span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button
                  v-if="!n.read_at"
                  class="flex-shrink-0 text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  :title="t('notifications.markRead')"
                  @click.stop="handleMarkRead(n)"
                >
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                </button>
                <button
                  class="flex-shrink-0 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-30"
                  :title="t('common.delete') || 'Delete'"
                  :disabled="deleting === (n.uuid || n.id)"
                  @click.stop="handleDelete(n)"
                >
                  <svg v-if="deleting === (n.uuid || n.id)" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  <svg v-else class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </InfiniteScroll>
    </div>

    <ConfirmModal
      :show="!!pendingDelete"
      :title="t('notifications.deleteConfirmTitle') || 'Delete notification'"
      :message="t('notifications.deleteConfirmMessage') || 'Are you sure you want to delete this notification?'"
      :confirm-text="t('common.delete') || 'Delete'"
      :is-danger="true"
      @confirm="confirmDelete"
      @close="cancelDelete"
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
