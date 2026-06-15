<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleField } from '../../composables/useLocaleField'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  popularArticles: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  activeTag: { type: String, default: '' },
  activeCategory: { type: String, default: '' }
})

const emit = defineEmits(['selectTag', 'selectCategory'])

const router = useRouter()
const { localField } = useLocaleField()
const { t } = useI18n()

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function goToArticle(id) {
  router.push(`/articles/${id}`)
}
</script>

<template>
  <aside class="space-y-6">
    <div class="card-base p-5">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
        </svg>
        {{ t('articlesListing.popularReads') }}
      </h3>

      <div v-if="loading" class="space-y-3">
        <div v-for="n in 4" :key="n" class="flex gap-3 animate-pulse">
          <div class="w-16 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0"></div>
          <div class="flex-1 space-y-1.5 pt-1">
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <div v-else-if="popularArticles.length === 0" class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
        {{ t('articlesListing.noArticles') }}
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="(article, i) in popularArticles"
          :key="article.id"
          class="flex gap-3 group cursor-pointer"
          @click="goToArticle(article.id)"
        >
          <span class="text-xs font-bold text-slate-300 dark:text-slate-600 w-5 leading-none pt-0.5 shrink-0">{{ i + 1 }}</span>
          <div class="w-16 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
            <img
              v-if="article.cover_image"
              :src="article.cover_image"
              :alt="localField(article, 'title')"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-slate-600 dark:to-slate-500"></div>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
              {{ localField(article, 'title') }}
            </h4>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {{ formatDate(article.published_at) }}
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div class="card-base p-5">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
          <path stroke-linecap="round" d="M6 6h.008v.008H6V6z"/>
        </svg>
        {{ t('articlesListing.popularTags') }}
      </h3>

      <div v-if="loading" class="flex flex-wrap gap-2">
        <div v-for="n in 8" :key="n" class="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
      </div>

      <div v-else-if="tags.length === 0" class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
        {{ t('common.noResults') }}
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag.id"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
          :class="activeTag === tag.slug
            ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:text-brand-primary'"
          @click="$emit('selectTag', activeTag === tag.slug ? '' : tag.slug)"
        >
          {{ tag.name?.en || tag.name }}
          <span v-if="tag.article_count !== undefined" class="ml-1 opacity-60">({{ tag.article_count }})</span>
        </button>
      </div>
    </div>

    <div class="card-base p-5">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/>
        </svg>
        {{ t('articlesListing.categories') }}
      </h3>

      <div v-if="loading" class="space-y-2">
        <div v-for="n in 5" :key="n" class="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
        {{ t('common.noResults') }}
      </div>

      <ul v-else class="space-y-1">
        <li
          v-for="cat in categories"
          :key="cat.id"
          class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
          :class="activeCategory === cat.slug
            ? 'bg-brand-primary/10 text-brand-primary font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'"
          @click="$emit('selectCategory', activeCategory === cat.slug ? '' : cat.slug)"
        >
          <span class="text-sm">{{ cat.name?.en || cat.name }}</span>
          <span
            class="text-xs font-medium px-2 py-0.5 rounded-full"
            :class="activeCategory === cat.slug
              ? 'bg-brand-primary/20 text-brand-primary'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          >
            {{ cat.article_count || 0 }}
          </span>
        </li>
      </ul>
    </div>
  </aside>
</template>
