<script setup>
import { ref, computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'

const notifStore = useNotificationsStore()
const filter = ref('all')
const currentPage = ref(1)
const perPage = 15

const notifications = computed(() => {
  let list = notifStore.notifications || []
  if (filter.value === 'unread') list = list.filter(n => !n.read)
  if (filter.value === 'read') list = list.filter(n => n.read)
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(notifications.value.length / perPage)))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return notifications.value.slice(start, start + perPage)
})

function markRead(n) {
  if (!n.read) notifStore.markAsRead(n.id)
}

function markAllRead() {
  notifStore.markAllAsRead()
}

const typeIcons = { appointment: 'calendar_month', message: 'mail', alert: 'warning', system: 'settings', reminder: 'notifications_active' }
const typeColors = { appointment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', message: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', alert: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', system: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400', reminder: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' }

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ notifStore.unreadCount }} unread / {{ notifications.length }} total</p>
      </div>
      <button v-if="notifStore.unreadCount > 0" class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition" @click="markAllRead">
        Mark all as read
      </button>
    </div>

    <div class="flex gap-2 flex-wrap">
      <button v-for="opt in [{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }, { key: 'read', label: 'Read' }]" :key="opt.key"
        class="rounded-lg px-3.5 py-2 text-xs font-bold transition"
        :class="filter === opt.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'"
        @click="currentPage = 1; filter = opt.key"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="space-y-2">
      <div
        v-for="n in paginated"
        :key="n.id"
        class="rounded-2xl border p-4 transition cursor-pointer"
        :class="n.read ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-brand-primary/20 bg-brand-primary/5 dark:bg-brand-primary/10'"
        @click="markRead(n)"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center" :class="typeColors[n.type] || 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'">
            <span class="material-symbols-outlined text-[18px]">{{ typeIcons[n.type] || 'notifications' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-bold text-slate-900 dark:text-white" :class="{ 'text-brand-primary dark:text-brand-primary': !n.read }">{{ n.title }}</p>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ n.time || n.createdAt || '—' }}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ n.message || n.body || '' }}</p>
          </div>
          <span v-if="!n.read" class="w-2 h-2 rounded-full bg-brand-primary shrink-0 mt-2" />
        </div>
      </div>
      <div v-if="paginated.length === 0" class="text-center text-sm text-slate-400 dark:text-slate-500 py-10">No notifications found.</div>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">Page {{ currentPage }} of {{ totalPages }}</p>
      <div class="flex gap-2">
        <button class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition" :disabled="currentPage === 1" @click="prevPage">Previous</button>
        <button class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
      </div>
    </div>
  </div>
</template>
