<script setup>
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import BaseBadge from '../global/BaseBadge.vue'

const props = defineProps({
  searches: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'clear'])

const { t, locale } = useI18n()

const typeVariants = {
  doctors: 'info',
  articles: 'primary',
  symptoms: 'warning',
}

function variantFor(type) {
  return typeVariants[type] || 'neutral'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('searchHistory.justNow') || 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('searchHistory.recentTitle') }}</h3>
      <button
        v-if="searches.length > 0"
        type="button"
        class="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
        @click="$emit('clear')"
      >
        {{ t('searchHistory.clearAll') }}
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="divide-y divide-slate-100 dark:divide-slate-800">
      <div v-for="i in 5" :key="i" class="flex items-center gap-3 px-5 py-3.5 animate-pulse">
        <div class="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
          <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="searches.length === 0" class="flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
      <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ t('searchHistory.noRecent') }}</p>
      <p class="text-xs text-slate-400 dark:text-slate-500 max-w-xs">{{ t('searchHistory.noRecentDesc') }}</p>
    </div>

    <!-- Search Items -->
    <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
      <div
        v-for="(item, idx) in searches"
        :key="item.uuid || item.id || idx"
        class="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
        @click="$emit('select', item)"
      >
        <svg class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ item.query }}</p>
          <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{{ timeAgo(item.created_at) }}</p>
        </div>
        <BaseBadge v-if="item.type" :variant="variantFor(item.type)" class="shrink-0">
          {{ item.type }}
        </BaseBadge>
        <button
          class="p-1 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition shrink-0 cursor-pointer"
          :title="t('common.search') || 'Search'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
