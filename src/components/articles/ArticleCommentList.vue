<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const { t } = useI18n()

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function userInitial(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <div class="space-y-5">
    <div v-if="loading && comments.length === 0" class="space-y-4">
      <div v-for="n in 3" :key="n" class="flex gap-3 animate-pulse">
        <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-10">
      <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.97 5.97 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
      </svg>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('articleDetail.noComments') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
      >
        <div class="shrink-0">
          <img
            v-if="comment.user_avatar"
            :src="comment.user_avatar"
            :alt="comment.user_name"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400"
          >
            {{ userInitial(comment.user_name) }}
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ comment.user_name }}</span>
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(comment.created_at) }}</span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
