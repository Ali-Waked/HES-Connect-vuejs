<script setup>
import LandingSection from './LandingSection.vue';
import LandingSkeleton from './LandingSkeleton.vue';

defineProps({
  articles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const categoryColors = {
  Medical: 'bg-teal-100 text-teal-700',
  Pediatrics: 'bg-blue-100 text-blue-700',
  Surgery: 'bg-purple-100 text-purple-700',
  Obstetrics: 'bg-pink-100 text-pink-700',
  'Health Policy': 'bg-amber-100 text-amber-700'
};
</script>

<template>
  <LandingSection class="py-16 lg:py-20 bg-landing-cream">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">Latest Medical Articles</h2>
        <span class="text-sm font-semibold text-brand-primary cursor-pointer">View All →</span>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LandingSkeleton variant="card" :count="3" />
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="article in articles"
          :key="article.id"
          class="bg-white rounded-xl border border-landing-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/20 transition-all duration-200"
        >
          <span :class="`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${categoryColors[article.category] || 'bg-slate-100 text-slate-600'}`">
            {{ article.category }}
          </span>
          <h3 class="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-3">{{ article.title }}</h3>
          <p class="text-sm text-slate-500 mb-1">{{ article.author_name }}</p>
          <p class="text-xs text-slate-400 mb-4">{{ article.published_at }}</p>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            {{ article.views?.toLocaleString() }} views
          </div>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span
              v-for="tag in (article.tags || []).slice(0, 3)"
              :key="tag.name"
              class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
            >{{ tag.name }}</span>
          </div>
          <button class="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition cursor-pointer">Read More →</button>
        </article>
      </div>
    </div>
  </LandingSection>
</template>
