<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFormatDate } from '@/composables/useFormatDate'
import axiosClient from '@/axiosClient'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  articleUuid: { type: String, default: null }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { localField } = useLocaleField()
const { formatDate } = useFormatDate()

const article = ref(null)
const loading = ref(false)

watch(() => props.show, async (val) => {
  if (val && props.articleUuid) {
    loading.value = true
    try {
      const { data } = await axiosClient.get(`/staff/articles/${props.articleUuid}`)
      article.value = data.data
    } catch {
      article.value = null
    } finally {
      loading.value = false
    }
  } else {
    article.value = null
  }
})

const statusClass = (status) => {
  const map = {
    pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  return map[status] || map.draft
}
</script>

<template>
  <Teleport to="body">
  <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('articles.viewArticle') || 'Article Details' }}</h3>
        <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16">
        <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>

      <div v-else-if="article" class="p-6 overflow-y-auto flex-1 space-y-6">
        <div v-if="article.cover_image" class="rounded-xl overflow-hidden -mx-6 -mt-6 mb-0">
          <img :src="article.cover_image" :alt="localField(article, 'title')" class="w-full h-48 object-cover" />
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(article.status)">
            {{ $t(`statuses.${article.status}`) }}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            {{ article.views || 0 }}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            {{ article.comments_count || 0 }}
          </span>
        </div>

        <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ localField(article, 'title') }}</h2>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.author') }}</p>
            <div v-if="article.author" class="flex items-center gap-2 mt-1">
              <AvatarInitial v-if="!article.author?.avatar" :name="localField(article.author, 'name')" class="!w-5 !h-5 !text-[8px]" />
              <img v-else :src="article.author.avatar" class="w-5 h-5 rounded-full object-cover" />
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(article.author, 'name') }}</p>
            </div>
            <p v-else class="text-sm font-semibold text-slate-900 dark:text-white mt-1">—</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.category') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ article.category ? localField(article.category, 'name') : '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('common.date') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ formatDate(article.created_at) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.publishedAt') || 'Published' }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ article.published_at ? formatDate(article.published_at) : '—' }}</p>
          </div>
        </div>

        <div>
          <div class="flex gap-1 mb-3">
            <span class="px-3 py-1 text-xs font-bold bg-brand-primary text-white rounded-lg">English</span>
          </div>
          <div class="prose prose-sm max-w-none dark:text-slate-300" v-html="article.content?.en || ''"></div>
        </div>

        <div>
          <div class="flex gap-1 mb-3">
            <span class="px-3 py-1 text-xs font-bold bg-brand-primary text-white rounded-lg">العربية</span>
          </div>
          <div class="prose prose-sm max-w-none dark:text-slate-300 text-right" dir="rtl" v-html="article.content?.ar || ''"></div>
        </div>

        <div v-if="article.tags && article.tags.length > 0">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ $t('articles.tags') }}</h4>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="tag in article.tags" :key="tag.uuid || tag.id" class="inline-flex items-center px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[11px] font-bold rounded-full border border-brand-primary/20">
              #{{ localField(tag, 'name') }}
            </span>
          </div>
        </div>

        <div v-if="article.comments && article.comments.length > 0">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{{ $t('articles.comments') || 'Comments' }} ({{ article.comments.length }})</h4>
          <div class="space-y-3">
            <div v-for="comment in article.comments" :key="comment.id" class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div class="flex items-center gap-2 mb-2">
                <AvatarInitial v-if="!comment.user?.avatar" :name="localField(comment.user, 'name')" class="!w-6 !h-6 !text-[8px]" />
                <img v-else :src="comment.user?.avatar" class="w-6 h-6 rounded-full object-cover" />
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(comment.user, 'name') }}</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ formatDate(comment.created_at) }}</span>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-300">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">
          {{ $t('common.close') }}
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
