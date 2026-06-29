<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '../../../stores/notifications'

const emit = defineEmits(['close'])
const store = useNotificationsStore()
const router = useRouter()
const { t } = useI18n()

const goToAll = () => {
  emit('close')
  router.push('/platform/notifications')
}

const handleClick = (n) => {
  if (!n.read_at) {
    store.markAsRead(n.uuid)
  }
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
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="fixed inset-0 z-[90]" @click="$emit('close')"></div>

  <div
    class="absolute top-full mt-2 w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[100] overflow-hidden animate-drop-in"
    :class="$i18n.locale === 'ar' ? 'left-0' : 'right-0'"
  >
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2.5">
        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ t('notifications.title') }}</span>
        <span
          v-if="store.unreadCount > 0"
          class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-full"
        >{{ store.unreadCount > 99 ? '99+' : store.unreadCount }}</span>
      </div>
      <button
        v-if="store.hasUnread"
        class="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition"
        @click="store.markAllAsRead()"
      >{{ t('notifications.markAllRead') }}</button>
    </div>

    <div v-if="store.loading && store.items.length === 0" class="p-5 space-y-3">
      <div v-for="i in 4" :key="i" class="flex items-start gap-3 animate-pulse">
        <div class="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="store.last5.length === 0" class="flex flex-col items-center justify-center py-12 gap-2">
      <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
        </svg>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ t('notifications.allCaughtUp') }}</p>
    </div>

    <div v-else class="divide-y divide-slate-50 dark:divide-slate-800 max-h-[380px] overflow-y-auto">
      <div
        v-for="n in store.last5"
        :key="n.id"
        class="flex gap-3 px-5 py-3.5 cursor-pointer transition-colors"
        :class="n.read_at ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/60' : 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/70 dark:hover:bg-blue-900/20'"
        @click="handleClick(n)"
      >
        <div class="flex-shrink-0 mt-0.5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="store.getConfig(n.type).bg">
            <svg class="w-4.5 h-4.5" :class="store.getConfig(n.type).icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" v-html="store.getConfig(n.type).svg"></svg>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{{ n.title }}</p>
            <span v-if="!n.read_at" class="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-brand-primary"></span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{{ n.message }}</p>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{{ timeAgo(n.created_at) }}</p>
        </div>
      </div>
    </div>

    <div class="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
      <button
        class="w-full text-center text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition cursor-pointer py-1"
        @click="goToAll"
      >{{ t('notifications.viewAll') }}</button>
    </div>
  </div>
</template>

<style scoped>
.animate-drop-in {
  animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}
@keyframes dropIn {
  from { opacity: 0; transform: scale(0.95) translateY(-8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
