<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../composables/useLocaleField'
import { usePublicArticles } from '../../composables/usePublicArticles'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import ArticleSearchFilters from '../../components/articles/ArticleSearchFilters.vue'
import ArticleCard from '../../components/articles/ArticleCard.vue'
import ArticleSidebar from '../../components/articles/ArticleSidebar.vue'
import ArticleSkeleton from '../../components/articles/ArticleSkeleton.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const { localField } = useLocaleField()

const {
  loading,
  heroLoading,
  articlesLoading,
  sidebarLoading,
  featuredArticles,
  articles,
  popularArticles,
  categories,
  tags,
  pagination,
  filters,
  error,
  fetchAll,
  setPage,
  selectTag,
  selectCategory,
  updateFilter,
  initFromQuery,
  syncQuery,
} = usePublicArticles()

const currentFeaturedIndex = ref(0)

const featuredArticle = computed(() => featuredArticles.value[currentFeaturedIndex.value] || null)

const featuredCategoryName = computed(() => {
  if (!featuredArticle.value) return ''
  const cat = featuredArticle.value.category
  if (!cat) return ''
  return localField(cat, 'name') || cat.name || ''
})

watch(() => featuredArticles.value.length, (len) => {
  if (currentFeaturedIndex.value >= len) {
    currentFeaturedIndex.value = Math.max(0, len - 1)
  }
})

function prevFeatured() {
  const len = featuredArticles.value.length
  if (len === 0) return
  currentFeaturedIndex.value = (currentFeaturedIndex.value - 1 + len) % len
}

function nextFeatured() {
  const len = featuredArticles.value.length
  if (len === 0) return
  currentFeaturedIndex.value = (currentFeaturedIndex.value + 1) % len
}

function goToFeatured(id) {
  if (id) router.push(`/articles/${id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

onMounted(() => {
  initFromQuery(route.query)
  fetchAll()
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <div class="relative hero-gradient overflow-hidden pt-28 lg:pt-32 pb-14 lg:pb-20">
      <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {{ t('articlesListing.pageTitle') }}
        </h1>
        <p class="mt-2 text-lg text-white/75 max-w-2xl">
          {{ t('articlesListing.pageDescription') }}
        </p>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
    </div>

    <main>
      <section v-if="heroLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        <div class="rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse">
          <div class="aspect-[21/9]"></div>
        </div>
      </section>

      <section v-if="!heroLoading && featuredArticle" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        <div class="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group cursor-pointer" @click="goToFeatured(featuredArticle.id)">
          <div class="aspect-[21/9] relative">
            <img
              v-if="featuredArticle.cover_image"
              :src="featuredArticle.cover_image"
              :alt="localField(featuredArticle, 'title')"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div v-else class="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-accent/10 dark:from-slate-600 dark:to-slate-500"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
          </div>

          <div class="absolute inset-0 p-6 lg:p-10 flex flex-col justify-end">
            <span class="inline-block px-3 py-1 rounded text-xs font-semibold text-white bg-brand-primary mb-3 w-fit">
              {{ featuredCategoryName }}
            </span>
            <h2 class="text-2xl lg:text-3xl font-bold text-white leading-tight mb-2 max-w-2xl hover:underline">
              {{ localField(featuredArticle, 'title') }}
            </h2>
            <p class="text-sm text-white/70">{{ formatDate(featuredArticle.published_at) }}</p>
          </div>

          <button
            v-if="featuredArticles.length > 1"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 cursor-pointer"
            @click.stop="prevFeatured"
          >
            <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
          </button>
          <button
            v-if="featuredArticles.length > 1"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 cursor-pointer"
            @click.stop="nextFeatured"
          >
            <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
          </button>

          <div v-if="featuredArticles.length > 1" class="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 flex gap-1.5">
            <button
              v-for="(_, i) in featuredArticles"
              :key="i"
              class="w-2 h-2 rounded-full transition-all cursor-pointer"
              :class="i === currentFeaturedIndex ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'"
              @click.stop="currentFeaturedIndex = i"
            />
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
        <div class="bg-slate-50 dark:bg-slate-800/40 rounded-md p-4 sm:p-5">
          <ArticleSearchFilters
            :categories="categories"
            :tags="tags"
            :search="filters.search"
            :category="filters.category"
            :tag="filters.tag"
            :sort="filters.sort"
            @update:search="updateFilter('search', $event)"
            @update:category="updateFilter('category', $event)"
            @update:tag="updateFilter('tag', $event)"
            @update:sort="updateFilter('sort', $event)"
          />
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div class="grid lg:grid-cols-3 gap-8 xl:gap-10">
          <div class="lg:col-span-2 space-y-8">
            <ArticleSkeleton
              v-if="articlesLoading && loading"
              variant="card-grid"
              :count="3"
            />

            <div v-else-if="articles.length === 0" class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-1">{{ t('articlesListing.emptyTitle') }}</h3>
              <p class="text-sm text-slate-400 dark:text-slate-500">{{ t('articlesListing.emptyDescription') }}</p>
            </div>

            <div v-else class="grid sm:grid-cols-2 gap-6">
              <ArticleCard
                v-for="article in articles"
                :key="article.id"
                :article="article"
              />
            </div>

            <div v-if="pagination.last_page > 1" class="flex items-center justify-center gap-2 pt-4">
              <button
                class="pagination-btn flex items-center justify-center"
                :class="pagination.current_page <= 1
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'pagination-btn-inactive'"
                :disabled="pagination.current_page <= 1"
                @click="setPage(pagination.current_page - 1)"
              >
                <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
              </button>

              <template v-for="page in pagination.last_page" :key="page">
                <button
                  v-if="page === 1 || page === pagination.last_page || Math.abs(page - pagination.current_page) <= 2"
                  class="pagination-btn"
                  :class="page === pagination.current_page
                    ? 'pagination-btn-active'
                    : 'pagination-btn-inactive'"
                  @click="setPage(page)"
                >{{ page }}</button>
                <span
                  v-else-if="page === pagination.current_page - 3 || page === pagination.current_page + 3"
                  class="text-slate-400 dark:text-slate-500"
                >...</span>
              </template>

              <button
                class="pagination-btn flex items-center justify-center"
                :class="pagination.current_page >= pagination.last_page
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'pagination-btn-inactive'"
                :disabled="pagination.current_page >= pagination.last_page"
                @click="setPage(pagination.current_page + 1)"
              >
                <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              </button>
            </div>

            <div v-if="!articlesLoading && articles.length > 0" class="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
              {{ t('common.showing') }} {{ pagination.from }}–{{ pagination.to }} {{ t('common.of') }} {{ pagination.total }}
            </div>
          </div>

          <aside class="lg:col-span-1 space-y-6 lg:sticky lg:top-28 lg:self-start">
            <ArticleSidebar
              :popular-articles="popularArticles"
              :tags="tags"
              :categories="categories"
              :loading="sidebarLoading"
              :active-tag="filters.tag"
              :active-category="filters.category"
              @select-tag="selectTag"
              @select-category="selectCategory"
            />
          </aside>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
