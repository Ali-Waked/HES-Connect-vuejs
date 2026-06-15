<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleField } from '../../composables/useLocaleField'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  articles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const router = useRouter()
const { t } = useI18n()
const { localField } = useLocaleField()

const current = ref(0)
let timer = null

function startAutoplay() {
  stopAutoplay()
  if (props.articles.length < 2) return
  timer = setInterval(() => {
    current.value = (current.value + 1) % props.articles.length
  }, 5000)
}

function stopAutoplay() {
  if (timer) clearInterval(timer)
  timer = null
}

function goTo(index) {
  current.value = index
  startAutoplay()
}

function goToArticle(id) {
  router.push(`/articles/${id}`)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}

onMounted(() => startAutoplay())
onUnmounted(() => stopAutoplay())
</script>

<template>
  <section class="relative overflow-hidden rounded-2xl card-base">
    <div v-if="loading" class="aspect-[21/9] bg-slate-200 dark:bg-slate-700 animate-pulse"></div>

    <template v-else-if="articles.length === 0">
      <div class="aspect-[21/9] bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
        <p class="text-slate-400 dark:text-slate-500 text-lg font-medium">{{ t('articlesListing.noArticles') }}</p>
      </div>
    </template>

    <template v-else>
      <div class="relative overflow-hidden">
        <div
          class="flex transition-transform duration-700 ease-out cursor-pointer"
          :style="{ transform: `translateX(-${current * 100}%)` }"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
        >
          <div
            v-for="article in articles"
            :key="article.id"
            class="min-w-full relative group"
            @click="goToArticle(article.id)"
          >
            <div class="aspect-[21/9] max-h-[500px] overflow-hidden bg-slate-100 dark:bg-slate-700">
              <img
                v-if="article.cover_image"
                :src="article.cover_image"
                :alt="localField(article, 'title')"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/20"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>

            <div class="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-brand-primary/90 backdrop-blur-sm mb-3">
                {{ localField(article.category?.name ? article.category : article, 'name') || localField(article, 'category') }}
              </span>
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2 max-w-3xl line-clamp-2">
                {{ localField(article, 'title') }}
              </h2>
              <p class="text-sm text-white/80 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z"/>
                </svg>
                {{ formatDate(article.published_at) }}
              </p>
            </div>
          </div>
        </div>

        <button
          v-if="articles.length > 1"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-slate-700 hover:text-brand-primary transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
          @click="goTo((current - 1 + articles.length) % articles.length)"
        >
          <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <button
          v-if="articles.length > 1"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-slate-700 hover:text-brand-primary transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
          @click="goTo((current + 1) % articles.length)"
        >
          <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>

        <div class="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 flex gap-2 z-10">
          <button
            v-for="(_, i) in articles"
            :key="i"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer"
            :class="i === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'"
            @click="goTo(i)"
          />
        </div>
      </div>
    </template>
  </section>
</template>
