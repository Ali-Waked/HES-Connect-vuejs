<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';
import ArticleModal from './ArticleModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';

const store = useDashboardStore();
const router = useRouter();

const searchQuery = ref('');
const statusFilter = ref('all');
const categoryFilter = ref('all');
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const modalMode = ref('add');
const selectedArticle = ref(null);

// â”€â”€â”€ Article cover colour palette (used for placeholder thumbnails) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const coverColors = [
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-teal-600',
  'from-blue-400 to-indigo-600',
  'from-violet-400 to-purple-600',
];
const coverColor = (id) => coverColors[(id - 1) % coverColors.length];

// â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const categories = computed(() => {
  const cats = store.articles.map(a => a.category);
  return ['all', ...new Set(cats)];
});

// â”€â”€â”€ Status helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const statusClass = (s) => ({
  'published':      'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'pending_review': 'bg-amber-100 text-amber-700 border border-amber-200',
  'draft':          'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  'archived':       'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700',
  'rejected':       'bg-red-100 text-red-600 border border-red-200',
}[s] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400');

const statusLabel = (s) => {
  return s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// â”€â”€â”€ Filtering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const filtered = computed(() => {
  return store.articles.filter(a => {
    const matchStatus = statusFilter.value === 'all' || a.status === statusFilter.value;
    const matchCategory = categoryFilter.value === 'all' || a.category === categoryFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
    return matchStatus && matchCategory && matchSearch;
  });
});

// â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const openAdd = () => { selectedArticle.value = null; modalMode.value = 'add'; showFormModal.value = true; };
const openEdit = (a) => { selectedArticle.value = a; modalMode.value = 'edit'; showFormModal.value = true; };
const openView = (a) => { router.push(`/admin/articles/${a.id}`); };
const confirmDel = (a) => { selectedArticle.value = a; showDeleteModal.value = true; };
const handleDelete = () => {
  if (selectedArticle.value) { store.deleteArticle(selectedArticle.value.id); showDeleteModal.value = false; selectedArticle.value = null; }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Articles Management</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ store.articleCount }} {{ store.articleCount === 1 ? 'article' : 'articles' }} in total</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAdd"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        New Article
      </button>
    </div>

    <!-- Stat Pills -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ store.articleCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Total</span>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-emerald-600">{{ store.publishedArticleCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Published</span>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-amber-600">{{ store.pendingArticleCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending</span>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ store.articleCount - store.publishedArticleCount - store.pendingArticleCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Other</span>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col md:flex-row gap-3">
      <div class="relative flex-grow">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" v-model="searchQuery" class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition" placeholder="Search articles..."/>
      </div>
      <div class="flex gap-2">
        <select v-model="statusFilter" class="min-w-[140px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="pending_review">Pending Review</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="rejected">Rejected</option>
        </select>
        <select v-model="categoryFilter" class="min-w-[140px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition">
          <option value="all">All Categories</option>
          <option v-for="cat in categories.filter(c => c !== 'all')" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      <!-- Empty -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">No articles match your criteria.</p>
        <button class="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer" @click="searchQuery='';statusFilter='all';categoryFilter='all'">Reset Filters</button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Article</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Views</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="article in filtered" :key="article.id" class="hover:bg-slate-50/50 transition-colors">
              <!-- Article Info (Image + Title + Content) -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-4 min-w-[320px]">
                  <!-- Placeholder Image -->
                  <div :class="`w-14 h-14 rounded-xl bg-gradient-to-br ${coverColor(article.id)} flex-shrink-0 flex items-center justify-center shadow-sm`">
                    <svg class="w-6 h-6 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <button
                      class="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-brand-primary transition cursor-pointer text-left leading-snug truncate block w-full"
                      :title="article.title"
                      @click="openView(article)"
                    >
                      {{ article.title }}
                    </button>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                      {{ article.content }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Author -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ article.author }}</span>
              </td>

              <!-- Category -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ article.category }}
              </td>

              <!-- Tags -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1 max-w-[200px]">
                  <span 
                    v-for="tagId in article.tags?.slice(0, 2)" 
                    :key="tagId"
                    class="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 rounded uppercase tracking-tighter"
                  >
                    #{{ getTagName(tagId) }}
                  </span>
                  <span v-if="article.tags?.length > 2" class="text-[10px] font-black text-slate-400 dark:text-slate-500">
                    +{{ article.tags.length - 2 }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(article.status)">
                  {{ statusLabel(article.status) }}
                </span>
              </td>

              <!-- Views -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ article.views.toLocaleString() }}
              </td>

              <!-- Published -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ article.publish_date || 'â€”' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex justify-end gap-1.5">
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer" title="View Article" @click="openView(article)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer" title="Edit Article" @click="openEdit(article)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer" title="Delete Article" @click="confirmDel(article)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ArticleModal :show="showFormModal" :article="selectedArticle" :mode="modalMode" @close="showFormModal = false"/>
    <ConfirmModal :show="showDeleteModal" title="Delete Article" :message="`Are you sure you want to delete <strong>${selectedArticle?.title}</strong>?`" confirm-text="Delete" @confirm="handleDelete" @close="showDeleteModal = false"/>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
