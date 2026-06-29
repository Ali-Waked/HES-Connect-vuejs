<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../composables/useLocaleField'
import { useArticleDetail } from '../../composables/useArticleDetail'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import ArticleCard from '../../components/articles/ArticleCard.vue'
import ArticleAuthorCard from '../../components/articles/ArticleAuthorCard.vue'
import ArticleShareSection from '../../components/articles/ArticleShareSection.vue'
import CategoryBadge from '../../components/shared/CategoryBadge.vue'
import FavoriteButton from '../../components/favorites/FavoriteButton.vue'
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
  popularArticles,
  latestArticles,
  categories,
  title,
  content,
  excerpt,
  categoryName,
  authorName,
  formatDate,
  goToTag,
  goToCategory,
  goToArticle,
} = useArticleDetail(props.id)
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <template v-if="loading">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
        <div class="animate-pulse space-y-6">
          <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
          <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div class="aspect-[21/9] bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div class="space-y-3">
            <div v-for="n in 8" :key="n" class="h-4 bg-slate-200 dark:bg-slate-700 rounded-md" :class="n % 2 === 0 ? 'w-full' : 'w-11/12'"></div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="error || notFound">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
        <div class="text-center py-20">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">{{ t('stories.notFound') }}</h2>
          <p class="text-slate-400 dark:text-slate-500 mb-4">{{ t('stories.notFoundDesc') }}</p>
          <button
            class="bg-brand-primary text-white rounded-lg px-5 py-2.5 font-semibold shadow-sm hover:bg-brand-primary-hover hover:shadow-lg transition-all cursor-pointer"
            @click="router.push('/articles')"
          >
            {{ t('articles.title') }}
          </button>
        </div>
      </div>
    </template>

    <template v-else-if="article">
      <div class="relative hero-gradient overflow-hidden pt-28 lg:pt-32 pb-14 lg:pb-20">
        <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
        <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
        <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="flex items-center gap-2 text-sm text-white/60 mb-4">
            <router-link to="/" class="hover:text-white transition-colors">{{ t('nav.home') }}</router-link>
            <span class="text-white/40">/</span>
            <router-link to="/articles" class="hover:text-white transition-colors">{{ t('articles.title') }}</router-link>
            <span class="text-white/40">/</span>
            <span class="text-white/80 truncate max-w-[200px] lg:max-w-xs">{{ title }}</span>
          </nav>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl lg:text-4xl font-extrabold text-white leading-tight max-w-4xl">
              {{ title }}
            </h1>
            <FavoriteButton :favoritable-id="article?.uuid || article?.id" favoritable-type="article" size="lg" />
          </div>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
      </div>

      <main>
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 lg:pt-10">
          <div class="grid lg:grid-cols-3 gap-8 xl:gap-12">

            <article class="lg:col-span-2 space-y-8">
              <div class="card-base p-6 sm:p-8 lg:p-10">
                <div class="flex flex-wrap items-center gap-3 mb-5">
                  <CategoryBadge
                    v-if="article.category"
                    :category="article.category"
                    size="sm"
                    class="cursor-pointer"
                    @click="goToCategory(article.category?.slug)"
                  />
                  <span v-if="article.reading_time_minutes" class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ t('articleDetail.readingTime', { min: article.reading_time_minutes }) }}
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(article.published_at) }}</span>
                </div>

                <div class="prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-brand-primary leading-relaxed prose-img:rounded-md prose-img:shadow-md">
                  {{ content }}
                </div>

                <div v-if="article.tags && article.tags.length" class="flex flex-wrap items-center gap-2 pt-8 mt-8 border-t border-slate-200 dark:border-slate-700">
                  <span class="text-sm font-medium text-slate-500 dark:text-slate-400 mr-1">{{ t('articleDetail.tags') }}:</span>
                  <button
                    v-for="tag in article.tags"
                    :key="tag.id"
                    class="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200 cursor-pointer"
                    @click="goToTag(tag.slug)"
                  >
                    {{ tag.name?.en || tag.name || tag }}
                  </button>
                </div>

                <div class="pt-8 mt-8 border-t border-slate-200 dark:border-slate-700">
                  <ArticleShareSection :article="article" />
                </div>
              </div>

              <div v-if="article.author">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {{ t('articleDetail.aboutAuthor') }}
                </h3>
                <div class="card-base p-6">
                  <ArticleAuthorCard :author="article.author" />
                </div>
              </div>

              <ArticleComments :article-id="props.id" />

              <div v-if="article.related_articles && article.related_articles.length">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">
                  {{ t('articleDetail.relatedArticles') }}
                </h3>
                <div class="grid sm:grid-cols-2 gap-5">
                  <ArticleCard
                    v-for="related in article.related_articles"
                    :key="related.id"
                    :article="related"
                  />
                </div>
              </div>
            </article>

            <aside class="lg:col-span-1 space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div class="card-base p-5">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  {{ t('articleDetail.popularArticles') }}
                </h3>

                <div v-if="sidebarLoading" class="space-y-3">
                  <div v-for="n in 4" :key="n" class="flex gap-3 animate-pulse">
                    <div class="w-16 h-14 bg-slate-200 dark:bg-slate-700 rounded shrink-0"></div>
                    <div class="flex-1 space-y-1.5 pt-1">
                      <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                <ul v-else-if="popularArticles.length > 0" class="space-y-3">
                  <li
                    v-for="(a, i) in popularArticles"
                    :key="a.id"
                    class="flex gap-3 group cursor-pointer"
                    @click="goToArticle(a.id)"
                  >
                    <span class="text-xs font-bold text-slate-300 dark:text-slate-600 w-5 leading-none pt-0.5 shrink-0">{{ i + 1 }}</span>
                    <div class="w-16 h-14 shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img
                        v-if="a.cover_image"
                        :src="a.cover_image"
                        :alt="localField(a, 'title')"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-slate-600 dark:to-slate-500"></div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
                        {{ localField(a, 'title') }}
                      </h4>
                      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ formatDate(a.published_at) }}</p>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">{{ t('articlesListing.noArticles') }}</p>
              </div>

              <div class="card-base p-5">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  {{ t('articleDetail.latestArticles') }}
                </h3>

                <div v-if="sidebarLoading" class="space-y-3">
                  <div v-for="n in 3" :key="n" class="flex gap-3 animate-pulse">
                    <div class="w-16 h-14 bg-slate-200 dark:bg-slate-700 rounded shrink-0"></div>
                    <div class="flex-1 space-y-1.5 pt-1">
                      <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                <ul v-else-if="latestArticles.length > 0" class="space-y-3">
                  <li
                    v-for="a in latestArticles"
                    :key="a.id"
                    class="flex gap-3 group cursor-pointer"
                    @click="goToArticle(a.id)"
                  >
                    <div class="w-16 h-14 shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img
                        v-if="a.cover_image"
                        :src="a.cover_image"
                        :alt="localField(a, 'title')"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-slate-600 dark:to-slate-500"></div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
                        {{ localField(a, 'title') }}
                      </h4>
                      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ formatDate(a.published_at) }}</p>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">{{ t('articlesListing.noArticles') }}</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </template>

    <LandingFooter />
  </div>
</template>
