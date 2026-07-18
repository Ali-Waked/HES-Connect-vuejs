<script setup>
import { useRouter } from 'vue-router';
import { useLocaleField } from '@/composables/useLocaleField';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  articles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const router = useRouter();
const { localField } = useLocaleField();
const { t } = useI18n();
</script>

<template>
  <section class="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-12 animate-fade-in-up">
        <div>
          <span class="eyebrow-badge mb-4">
            Latest
          </span>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Healthcare Articles</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-2">Stay informed with the latest healthcare news and insights.</p>
        </div>
        <button
          class="btn-ghost shrink-0"
          @click="router.push('/articles')"
        >
          {{ t('articles.viewAll') }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
          <div class="h-72 bg-slate-100 dark:bg-slate-800"></div>
        </div>
        <div class="space-y-6">
          <div v-for="n in 2" :key="n" class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
            <div class="h-40 bg-slate-100 dark:bg-slate-800"></div>
          </div>
        </div>
      </div>

      <div v-else-if="articles.length === 0" class="text-center py-12 animate-fade-in-up">
        <p class="text-slate-500">No articles available yet.</p>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <article
          class="lg:col-span-2 group relative rounded-xl overflow-hidden cursor-pointer card-base animate-fade-in-up"
          @click="router.push(`/articles/${articles[0]?.uuid || articles[0]?.id}`)"
        >
          <div class="grid sm:grid-cols-5 h-full">
            <div class="sm:col-span-3 relative h-60 sm:h-auto overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-primary/30">
              <div v-if="articles[0]?.cover_image || articles[0]?.image" class="absolute inset-0">
                <img :src="articles[0].cover_image || articles[0].image" :alt="localField(articles[0], 'title')" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div v-else class="absolute inset-0 flex items-center justify-center">
                <svg class="w-20 h-20 text-brand-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
              </div>
              <div v-if="articles[0]?.category" class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-lg">{{ articles[0].category }}</span>
              </div>
            </div>
            <div class="sm:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
              <span class="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">Featured Article</span>
          <h3 class="text-lg lg:text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-2 mb-2">{{ localField(articles[0], 'title') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{{ localField(articles[0], 'excerpt') || localField(articles[0], 'summary') || '' }}</p>
          <div class="mt-4 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span v-if="articles[0]?.author_name" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                  {{ articles[0].author_name }}
                </span>
                <span v-if="articles[0]?.published_at">{{ articles[0].published_at }}</span>
              </div>
            </div>
          </div>
        </article>

        <div class="space-y-6 lg:space-y-8">
          <article
            v-for="(article, idx) in articles.slice(1, 3)"
            :key="article.id"
            class="group card-base overflow-hidden cursor-pointer animate-fade-in-up"
            :style="{ animationDelay: `${(idx + 1) * 0.1}s` }"
            @click="router.push(`/articles/${article.uuid || article.id}`)"
          >
            <div class="relative h-40 overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-primary/30">
              <div v-if="article.cover_image || article.image" class="absolute inset-0">
                <img :src="article.cover_image || article.image" :alt="localField(article, 'title')" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div v-if="article.category" class="absolute top-3 left-3">
                <span class="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-md">{{ article.category }}</span>
              </div>
            </div>
            <div class="p-5">
              <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-2 mb-1">{{ localField(article, 'title') }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{{ localField(article, 'excerpt') || localField(article, 'summary') || '' }}</p>
              <div class="mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span v-if="article.published_at">{{ article.published_at }}</span>
                <span class="inline-flex items-center gap-1 text-brand-primary font-semibold ml-auto">
                  Read
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
