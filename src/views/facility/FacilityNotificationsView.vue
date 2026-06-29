<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t, locale } = useI18n()
const store = useNotificationsStore()
const auth = useAuthStore()

const filter = ref('all')
const deleting = ref(null)

const displayed = computed(() => {
  let list = store.items
  if (filter.value === 'unread') list = list.filter(n => !n.read_at)
  if (filter.value === 'read') list = list.filter(n => n.read_at)
  return list
})

function handleItemClick(n) {
  if (n.action_url) router.push(n.action_url)
  if (!n.read_at) store.markAsRead(n.uuid)
}

function handleDelete(n) {
  deleting.value = n.uuid || n.id
  store.deleteNotification(n.uuid || n.id).finally(() => {
    deleting.value = null
  })
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

onMounted(() => {
  store.fetchNotifications({ page: 1 })
  const userId = auth.user?.uuid || auth.user?.id
  if (userId) store.subscribeToChannel(userId)
})

onUnmounted(() => {
  store.cleanup()
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('notifications.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ store.unreadCount > 0 ? `${store.unreadCount} ${t('notifications.unread')}` : t('notifications.allCaughtUp') }}
          &middot; {{ store.pagination.total }} total
        </p>
      </div>
      <button
        v-if="store.hasUnread"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        @click="store.markAllAsRead()"
      >
        {{ t('notifications.markAllRead') }}
      </button>
    </div>

    <div class="flex gap-2 flex-wrap">
      <button
        v-for="opt in [{ key: 'all', label: t('common.all') || 'All' }, { key: 'unread', label: t('notifications.unreadOnly') }, { key: 'read', label: t('notifications.showAll') }]"
        :key="opt.key"
        class="rounded-lg px-3.5 py-2 text-xs font-bold transition cursor-pointer"
        :class="filter === opt.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'"
        @click="filter = opt.key"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="store.loading && store.items.length === 0" class="space-y-2">
      <div v-for="i in 5" :key="i" class="flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 animate-pulse">
        <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
        </div>
      </div>
    </div>

    <div v-else-if="displayed.length === 0" class="text-center text-sm text-slate-400 dark:text-slate-500 py-16">
      {{ filter === 'unread' ? t('notifications.noUnread') : t('notifications.allCaughtUp') }}
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="n in displayed"
        :key="n.id"
        class="rounded-2xl border p-4 transition cursor-pointer group"
        :class="n.read_at ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-brand-primary/20 bg-brand-primary/5 dark:bg-brand-primary/10'"
        @click="handleItemClick(n)"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center" :class="store.getConfig(n.type).bg">
            <svg class="w-[18px] h-[18px]" :class="store.getConfig(n.type).icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" v-html="store.getConfig(n.type).svg"></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-bold text-slate-900 dark:text-white" :class="{ 'text-brand-primary': !n.read_at }">{{ n.title }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ n.message }}</p>
              </div>
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                <span class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ timeAgo(n.created_at) }}</span>
                <span v-if="!n.read_at" class="w-2 h-2 rounded-full bg-brand-primary" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button
              v-if="!n.read_at"
              class="text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              :title="t('notifications.markRead')"
              @click.stop="store.markAsRead(n.uuid)"
            >
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            </button>
            <button
              class="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-30"
              :disabled="deleting === (n.uuid || n.id)"
              @click.stop="handleDelete(n)"
            >
              <svg v-if="deleting === (n.uuid || n.id)" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              <svg v-else class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.pagination.lastPage > 1" class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {{ t('common.page', { current: store.pagination.page, total: store.pagination.lastPage }) || `Page ${store.pagination.page} of ${store.pagination.lastPage}` }}
      </p>
      <div class="flex gap-2">
        <button
          class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
          :disabled="store.pagination.page <= 1"
          @click="store.fetchNotifications({ page: store.pagination.page - 1 })"
        >{{ t('common.previous') || 'Previous' }}</button>
        <button
          class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
          :disabled="store.pagination.page >= store.pagination.lastPage"
          @click="store.fetchNotifications({ page: store.pagination.page + 1 })"
        >{{ t('common.next') || 'Next' }}</button>
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
