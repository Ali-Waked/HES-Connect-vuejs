<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';
import { useTagsStore } from '../../../stores/tags';

const route = useRoute();
const router = useRouter();
const store = useDashboardStore();
const tagsStore = useTagsStore();

const articleId = computed(() => parseInt(route.params.id));
const article = computed(() => store.articles.find(a => a.id === articleId.value));

const articleTags = computed(() => {
  if (!article.value || !article.value.tags) return [];
  return article.value.tags.map(id => tagsStore.tags.find(t => t.id === id)).filter(Boolean);
});

const goBack = () => router.push('/admin/articles');

// ─── Status helpers ──────────────────────────────────────────────────────────
const statusClass = (s) => ({
  'published':      'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'pending_review': 'bg-amber-100 text-amber-700 border border-amber-200',
  'draft':          'bg-slate-100 text-slate-600 border border-slate-200',
  'archived':       'bg-gray-100 text-gray-600 border border-gray-200',
  'rejected':       'bg-red-100 text-red-600 border border-red-200',
}[s] || 'bg-slate-100 text-slate-600');

const statusLabel = (s) => {
  return s ? s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
};
</script>

<template>
  <div v-if="article" class="max-w-4xl mx-auto space-y-6 animate-fade-in">
    <!-- Breadcrumbs / Back -->
    <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
      <button @click="goBack" class="hover:text-brand-primary transition cursor-pointer">Articles</button>
      <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-slate-900 truncate max-w-[200px]">{{ article.title }}</span>
    </nav>

    <!-- Article Header Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-8 space-y-6">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
              {{ article.category }}
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(article.status)">
              {{ statusLabel(article.status) }}
            </span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {{ article.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-y-3 gap-x-6 pt-2 border-t border-slate-100 mt-6">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Author</span>
                <span class="text-sm font-bold text-slate-900">{{ article.author }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Published</span>
                <span class="text-sm font-bold text-slate-900">{{ article.publish_date || 'Not Published' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Views</span>
                <span class="text-sm font-bold text-slate-900">{{ article.views.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="prose prose-slate max-w-none pt-8 border-t border-slate-100">
          <p class="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
            {{ article.content }}
          </p>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
        <button 
          v-if="article.status === 'pending_review'"
          @click="store.updateArticleStatus(article.id, 'published')"
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          Approve & Publish
        </button>
        <button 
          v-if="article.status === 'published'"
          @click="store.updateArticleStatus(article.id, 'archived')"
          class="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition cursor-pointer"
        >
          Archive Article
        </button>
        <button 
          @click="goBack"
          class="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-lg transition cursor-pointer"
        >
          Back to List
        </button>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
    <div class="w-12 h-12 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
    <p class="font-medium">Loading article...</p>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
