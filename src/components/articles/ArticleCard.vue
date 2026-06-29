<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleField } from '../../composables/useLocaleField'
import { useI18n } from 'vue-i18n'
import CategoryBadge from '../shared/CategoryBadge.vue'
import FavoriteButton from '../favorites/FavoriteButton.vue'
import { resolveTranslatedValue } from '../../utils/locale'

const props = defineProps({
  article: { type: Object, required: true },
  featured: { type: Boolean, default: false }
})

const router = useRouter()
const { localField } = useLocaleField()
const { t } = useI18n()

const coverSrc = computed(() => props.article.cover_image || '')

const title = computed(() => localField(props.article, 'title'))

const excerpt = computed(() => {
  const ex = localField(props.article, 'excerpt')
  if (ex) return ex
  const content = localField(props.article, 'content')
  return content ? content.substring(0, 120) + '...' : ''
})

const categoryName = computed(() => {
  const cat = props.article.category
  if (!cat) return localField(props.article, 'category') || ''
  return localField(cat, 'name') || cat.name || ''
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function goToArticle() {
  router.push(`/articles/${props.article.id}`)
}

const authorName = computed(() => {
  const author = props.article.author
  if (!author) return props.article.author_name || ''
  return resolveTranslatedValue(author.name) || ''
})
</script>

<template>
  <article
    class="group card-base overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    :class="{ 'lg:col-span-2 lg:row-span-2': featured }"
    @click="goToArticle"
  >
    <div class="relative overflow-hidden" :class="featured ? 'aspect-[16/9] lg:aspect-[21/9]' : 'aspect-[16/9]'">
      <img
        v-if="coverSrc"
        :src="coverSrc"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-slate-700 dark:to-slate-600"></div>

      <div class="absolute top-3 left-3 z-10">
        <CategoryBadge v-if="article.category" :category="article.category" size="sm" class="shadow-sm" />
        <span v-else-if="categoryName" class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-brand-primary/90 backdrop-blur-sm shadow-sm">
          {{ categoryName }}
        </span>
      </div>
      <div class="absolute top-3 right-3 z-10">
        <FavoriteButton :favoritable-id="article.uuid || article.id" favoritable-type="article" :is-favorited="article.is_favorited" size="sm" @click.stop />
      </div>
    </div>

    <div class="p-5">
      <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors">
        {{ title }}
      </h3>

      <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
        {{ excerpt }}
      </p>

      <div class="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-4">
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          {{ article.views?.toLocaleString() }}
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
          </svg>
          {{ article.comments_count || 0 }}
        </span>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-7 h-7 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
            {{ (authorName || '?').charAt(0) }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{{ authorName }}</p>
            <p class="text-[10px] text-slate-400 dark:text-slate-500">{{ formatDate(article.published_at) }}</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-brand-primary group-hover:underline shrink-0 flex items-center gap-1">
          {{ t('articlesListing.readMore') }}
          <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </span>
      </div>
    </div>
  </article>
</template>
