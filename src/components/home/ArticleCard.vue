<script setup>
import FavoriteButton from '../favorites/FavoriteButton.vue'

defineProps({
  article: { type: Object, required: true },
})

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <article
    class="group card-hover overflow-hidden cursor-pointer animate-fade-in-up"
    @click="$router.push(`/articles/${article.uuid}`)"
  >
    <div class="relative h-44 overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-primary/30">
      <img
        v-if="article.cover_image"
        :src="article.cover_image"
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-16 h-16 text-brand-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
        </svg>
      </div>
      <div v-if="article.category" class="absolute top-3 left-3">
        <span class="px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-md">
          {{ article.category.name }}
        </span>
      </div>
      <div class="absolute top-3 right-3 flex items-center gap-1.5">
        <div class="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-md text-white text-xs">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
            <path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {{ article.views ?? 0 }}
        </div>
        <FavoriteButton :favoritable-id="article.uuid || article.id" favoritable-type="article" :is-favorited="article.is_favorited" size="sm" @click.stop />
      </div>
    </div>
    <div class="p-5">
      <div v-if="article.author" class="flex items-center gap-2 mb-3">
        <div class="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px] font-bold">
          {{ article.author.name?.charAt(0) || '?' }}
        </div>
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ article.author.name }}</span>
      </div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
        {{ article.title }}
      </h3>
      <div class="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>{{ fmtDate(article.published_at) }}</span>
        <span class="inline-flex items-center gap-1 text-brand-primary font-semibold group-hover:gap-1.5 transition-all">
          Read
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </span>
      </div>
    </div>
  </article>
</template>
