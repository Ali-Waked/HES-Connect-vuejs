<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../composables/useLocaleField'
import { useArticleDetail } from '../../composables/useArticleDetail'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import ArticleAuthorCard from '../../components/articles/ArticleAuthorCard.vue'
import ArticleShareSection from '../../components/articles/ArticleShareSection.vue'
import CategoryBadge from '../../components/shared/CategoryBadge.vue'
import FavoriteButton from '../../components/favorites/FavoriteButton.vue'
import ArticleSidebar from '../../components/articles/ArticleSidebar.vue'
import ArticleComments from '../../components/articles/ArticleComments.vue'

const props = defineProps({ id: { type: String, default: '' } })

const router = useRouter()
const { t, locale } = useI18n()
const { localField } = useLocaleField()

const {
  article,
  loading,
  error,
  notFound,
  sidebarLoading,
  mostRead,
  popularTopics,
  categories,
  title,
  content,
  authorName,
  formatDate,
  goToCategory,
} = useArticleDetail(props.id)

const readingTime = computed(() => {
  if (!content.value) return ''
  const words = content.value.split(/\s+/).length
  const min = Math.max(1, Math.ceil(words / 200))
  return t('articleDetail.readingTime', { min })
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">

      <!-- Loading -->
      <div v-if="loading" class="space-y-6 animate-pulse">
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
        <div class="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        <div class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-4">
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-32"></div>
            <div class="space-y-3">
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-4/6"></div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
            <div class="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        </div>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-300">{{ error }}</p>
      </div>

      <!-- Not Found -->
      <div v-else-if="notFound" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ t('stories.notFound') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('stories.notFoundDesc') }}</p>
        <router-link to="/articles" class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:bg-brand-primary-hover transition">{{ t('articles.title') }}</router-link>
      </div>

      <!-- Article Detail -->
      <div v-else-if="article" class="space-y-6 animate-fade-in">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <router-link to="/" class="hover:text-brand-primary transition">{{ t('nav.home') }}</router-link>
          <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <router-link to="/articles" class="hover:text-brand-primary transition">{{ t('articles.title') }}</router-link>
          <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-slate-900 dark:text-white truncate max-w-[250px]">{{ title }}</span>
        </nav>

        <!-- Cover Image -->
        <div v-if="article.cover_image" class="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
          <img :src="article.cover_image" :alt="title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          <div class="absolute top-4 right-4">
            <FavoriteButton :favoritable-id="article.uuid" favoritable-type="article" :is-favorited="article.is_favorited" />
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <CategoryBadge v-if="article.category" :category="article.category" size="sm" class="mb-3" />
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">{{ title }}</h1>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Cover placeholder if no image -->
            <div v-if="!article.cover_image" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <div class="flex items-center justify-between mb-3">
                <CategoryBadge v-if="article.category" :category="article.category" size="sm" />
                <FavoriteButton :favoritable-id="article.uuid" favoritable-type="article" :is-favorited="article.is_favorited" />
              </div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{{ title }}</h1>
            </div>

            <!-- Tags row -->
            <div class="flex flex-wrap items-center gap-3">
              <CategoryBadge v-if="!article.cover_image && article.category" :category="article.category" size="sm" />
              <span v-if="readingTime" class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">
                {{ readingTime }}
              </span>
              <span class="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                {{ t('articleDetail.views', { count: article.views || 0 }) }}
              </span>
              <span class="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/></svg>
                {{ article.comments_count || 0 }}
              </span>
              <span class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">
                {{ formatDate(article.published_at) }}
              </span>
            </div>

            <!-- Tags pills -->
            <div v-if="article.tags && article.tags.length" class="flex flex-wrap items-center gap-2">
              <span v-for="tag in article.tags" :key="tag.uuid" class="px-3 py-1.5 bg-brand-primary/5 text-brand-primary text-xs font-bold rounded-lg">
                {{ localField(tag, 'name') }}
              </span>
            </div>

            <!-- Content -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                {{ t('articleDetail.articleContent') || 'Article' }}
              </h2>
              <div class="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-brand-primary leading-relaxed prose-img:rounded-xl prose-img:shadow-md text-sm">
                {{ content }}
              </div>

              <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <ArticleShareSection :article="article" />
              </div>
            </div>

            <!-- Comments -->
            <ArticleComments :article-id="props.id" />
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Author Card -->
            <div v-if="article.author" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                {{ t('articleDetail.aboutAuthor') }}
              </h3>
              <ArticleAuthorCard :author="article.author" />
            </div>

            <!-- Article Details Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('articleDetail.articleDetails') || 'Article Details' }}</h3>

              <div v-if="article.category" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" d="M6 6h.008v.008H6V6z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('articlesListing.categories') }}</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ localField(article.category, 'name') }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('articleDetail.publishedDate') || 'Published' }}</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDate(article.published_at) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('articleDetail.views') }}</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ article.views?.toLocaleString() || 0 }}</p>
                </div>
              </div>

              <hr class="border-slate-100 dark:border-slate-700" />

              <div v-if="article.tags && article.tags.length" class="space-y-2">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('articleDetail.tags') }}</p>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="tag in article.tags" :key="tag.uuid" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[11px] font-semibold rounded-md">
                    {{ localField(tag, 'name') }}
                  </span>
                </div>
              </div>
            </div>

            <ArticleSidebar
              :most-read="mostRead"
              :popular-topics="popularTopics"
              :categories="categories"
              :loading="sidebarLoading"
            />
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
