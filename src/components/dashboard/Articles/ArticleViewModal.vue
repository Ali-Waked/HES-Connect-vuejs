<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { useArticles } from '../../../composables/useArticles';

const props = defineProps({
  show: { type: Boolean, required: true },
  articleUuid: { type: String, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const { fetchArticle } = useArticles();

const article = ref(null);
const loading = ref(false);

watch(() => props.show, async (val) => {
  if (val && props.articleUuid) {
    loading.value = true;
    try {
      const data = await fetchArticle(props.articleUuid);
      article.value = data;
    } catch (e) {
      article.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    article.value = null;
  }
});

const statusClass = (status) => {
  const map = {
    published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return map[status] || map.draft;
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('articles.viewArticle') || 'Article Details' }}</h3>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
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

        <div v-if="article.cover_image" class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <img :src="article.cover_image" :alt="localField(article, 'title')" class="w-full h-64 object-cover" />
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(article.status)">
            {{ $t(`statuses.${article.status}`) }}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            {{ article.views || 0 }}
          </span>
        </div>

        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ localField(article, 'title') }}</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.author') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ article.author ? localField(article.author, 'name') : '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.category') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ article.category ? localField(article.category, 'name') : '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('common.date') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ formatDate(article.created_at) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('common.updated') || 'Updated' }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ formatDate(article.updated_at) }}</p>
          </div>
        </div>

        <div v-if="article.gallery_images && article.gallery_images.length > 0">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ $t('articles.galleryImages') || 'Gallery' }}</h4>
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
            <div v-for="(img, i) in article.gallery_images" :key="i" class="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <img :src="img.image_url || img" class="w-full h-full object-cover" />
            </div>
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
      </div>

      <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">
          {{ $t('common.close') }}
        </button>
      </div>
    </div>
  </div>
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
