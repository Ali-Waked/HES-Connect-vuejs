<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { usePublicArticles } from '@/composables/usePublicArticles'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import ArticleCard from '@/components/articles/ArticleCard.vue'
import ArticleSidebar from '@/components/articles/ArticleSidebar.vue'
import ArticleSkeleton from '@/components/articles/ArticleSkeleton.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const { localField } = useLocaleField()

const {
  loading, articlesLoading, sidebarLoading,
  articles, mostRead, popularTopics, categories,
  pagination, filters, error,
  fetchAll, setPage, selectCategory, updateFilter, initFromQuery,
} = usePublicArticles()

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => { initFromQuery(route.query); fetchAll() })
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {{ t('articlesListing.pageTitle') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('articlesListing.pageDescription') }}
        </p>
      </div>

      <!-- Most Read -->
      <div v-if="mostRead.length > 0" class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
            </svg>
            {{ t('articlesListing.popularReads') }}
          </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div
            v-for="item in mostRead"
            :key="item.uuid"
            class="relative group rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[4/3] cursor-pointer"
            @click="router.push(`/articles/${item.uuid}`)"
          >
            <img
              v-if="item.cover_image"
              :src="item.cover_image"
              :alt="localField(item, 'title')"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-slate-600 dark:to-slate-500"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <h3 class="text-sm font-semibold text-white leading-snug line-clamp-2 drop-shadow-sm">
                {{ localField(item, 'title') }}
              </h3>
              <p class="text-[10px] text-white/70 mt-1">{{ formatDate(item.published_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4 max-w-3xl mx-auto">
        <div class="relative flex-grow">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input type="text" :placeholder="t('articlesListing.searchPlaceholder') || 'Search articles...'" class="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-sm transition" :value="filters.search" @input="updateFilter('search', $event.target.value)" />
        </div>
        <select class="min-w-[160px] p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer shadow-sm transition" :value="filters.sort_by" @change="updateFilter('sort_by', $event.target.value)">
          <option value="latest">{{ t('common.latest') || 'Latest' }}</option>
          <option value="oldest">{{ t('common.oldest') || 'Oldest' }}</option>
        </select>
      </div>

      <!-- Category Filters -->
      <div v-if="categories.length" class="flex flex-wrap justify-center gap-2 mb-8">
        <button class="rounded-full px-4 py-2 text-xs font-bold border transition-all cursor-pointer" :class="!filters.category ? 'bg-brand-primary text-white border-brand-primary shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-primary/40 hover:text-brand-primary bg-white dark:bg-slate-800'" @click="updateFilter('category', '')">{{ t('common.all') || 'All' }}</button>
        <button v-for="cat in categories" :key="cat.uuid" class="rounded-full px-4 py-2 text-xs font-bold border transition-all cursor-pointer" :class="filters.category === cat.uuid ? 'bg-brand-primary text-white border-brand-primary shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-primary/40 hover:text-brand-primary bg-white dark:bg-slate-800'" @click="updateFilter('category', cat.uuid)">{{ localField(cat, 'name') }}</button>
      </div>

      <!-- Active Filters -->
      <div v-if="filters.search || filters.category" class="flex justify-center items-center gap-2 mb-6 text-sm">
        <span v-if="filters.search" class="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full">"{{ filters.search }}"</span>
        <button class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary underline underline-offset-2 cursor-pointer" @click="updateFilter('search', ''); updateFilter('category', '')">'Clear Filters'</button>
      </div>

      <!-- Content Grid -->
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <ArticleSkeleton v-if="articlesLoading && loading" variant="card-grid" :count="3" />

          <div v-else-if="articles.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div class="w-14 h-14 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
              <span class="material-symbols-outlined text-2xl">article</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('articlesListing.emptyTitle') }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('articlesListing.emptyDescription') }}</p>
          </div>

          <div v-else class="grid sm:grid-cols-2 gap-6">
            <ArticleCard v-for="article in articles" :key="article.uuid" :article="article" />
          </div>

          <!-- Pagination -->
          <div v-if="pagination.last_page > 1" class="flex justify-center pt-4">
            <nav class="flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm">
              <button class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="pagination.current_page <= 1 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" :disabled="pagination.current_page <= 1" @click="setPage(pagination.current_page - 1)">
                <span class="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <template v-for="page in pagination.last_page" :key="page">
                <button v-if="page === 1 || page === pagination.last_page || Math.abs(page - pagination.current_page) <= 2" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="page === pagination.current_page ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" @click="setPage(page)">{{ page }}</button>
                <span v-else-if="page === pagination.current_page - 3 || page === pagination.current_page + 3" class="w-9 h-9 flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm">...</span>
              </template>
              <button class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="pagination.current_page >= pagination.last_page ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" :disabled="pagination.current_page >= pagination.last_page" @click="setPage(pagination.current_page + 1)">
                <span class="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </nav>
          </div>

          <div v-if="!articlesLoading && articles.length > 0" class="text-center text-xs text-slate-400 dark:text-slate-500">
            {{ t('common.showing') }} {{ pagination.from }}–{{ pagination.to }} {{ t('common.of') }} {{ pagination.total }}
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="lg:col-span-1 space-y-6 lg:sticky lg:top-28 lg:self-start">
          <ArticleSidebar
            :most-read="mostRead"
            :popular-topics="popularTopics"
            :categories="categories"
            :loading="sidebarLoading"
            :active-category="filters.category"
            @select-category="selectCategory"
          />
        </aside>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
