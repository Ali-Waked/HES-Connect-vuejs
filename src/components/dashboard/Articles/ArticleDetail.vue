<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '../../../stores/dashboard';
import { useTagsStore } from '../../../stores/tags';
import { useLocaleField } from '../../../composables/useLocaleField';
import CategoryBadge from '../../shared/CategoryBadge.vue';
import { useArticleComments } from '../../../composables/useArticleComments';
import * as dashboardCommentService from '../../../services/dashboard/commentService';
import CommentTable from './CommentTable.vue';
import ConfirmModal from '../global/ConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const store = useDashboardStore();
const tagsStore = useTagsStore();

const articleId = computed(() => parseInt(route.params.id));
const article = computed(() => store.articles.find(a => a.id === articleId.value));

const { localField } = useLocaleField();

const articleTags = computed(() => {
  if (!article.value || !article.value.tags) return [];
  return article.value.tags.map(id => tagsStore.tags.find(t => t.id === id)).filter(Boolean);
});

const goBack = () => router.push('/platform/articles');

const articleUuid = computed(() => route.params.id);

const {
  comments,
  loading: commentsLoading,
  fetchComments,
  deleteComment,
  updateCommentStatus,
} = useArticleComments(articleUuid, { service: dashboardCommentService })

const confirmDeleteId = ref(null)
const confirmStatusId = ref(null)
const confirmStatusAction = ref('')

onMounted(fetchComments)

function requestDelete(commentId) {
  confirmDeleteId.value = commentId
}

function confirmDelete() {
  if (confirmDeleteId.value) {
    deleteComment(confirmDeleteId.value)
    confirmDeleteId.value = null
  }
}

function requestStatusChange(commentId, action) {
  confirmStatusId.value = commentId
  confirmStatusAction.value = action
}

function confirmStatusChange() {
  if (confirmStatusId.value) {
    const newStatus = confirmStatusAction.value === 'hide' ? 'hidden' : 'visible'
    updateCommentStatus(confirmStatusId.value, newStatus)
    confirmStatusId.value = null
    confirmStatusAction.value = ''
  }
}

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
    <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
      <button @click="goBack" class="hover:text-brand-primary transition cursor-pointer">Articles</button>
      <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-slate-900 dark:text-white truncate max-w-[200px]">{{ localField(article, 'title') }}</span>
    </nav>

    <!-- Article Header Card -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div class="p-8 space-y-6">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <span v-if="typeof article.category === 'string'" class="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
              {{ article.category }}
            </span>
            <CategoryBadge v-else-if="article.category" :category="article.category" size="sm" />
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(article.status)">
              {{ statusLabel(article.status) }}
            </span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {{ localField(article, 'title') }}
          </h1>

          <div class="flex flex-wrap items-center gap-y-3 gap-x-6 pt-2 border-t border-slate-100 dark:border-slate-800 mt-6">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Author</span>
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ article.author }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Published</span>
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ article.publish_date || 'Not Published' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Views</span>
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ article.views.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-none pt-8 border-t border-slate-100 dark:border-slate-800">
          <p class="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
            {{ localField(article, 'content') }}
          </p>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
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
          class="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold rounded-lg transition cursor-pointer"
        >
          Back to List
        </button>
      </div>
    </div>

    <div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ t('comment.title') }}</h2>
      <CommentTable
        :comments="comments"
        :loading="commentsLoading"
        @hide="requestStatusChange($event, 'hide')"
        @show="requestStatusChange($event, 'show')"
        @delete="requestDelete($event)"
      />
    </div>

    <ConfirmModal
      :show="!!confirmDeleteId"
      :title="t('comment.confirmDeleteTitle')"
      :message="t('comment.confirmDeleteMessage')"
      :confirm-text="t('common.delete')"
      :is-danger="true"
      @confirm="confirmDelete"
      @close="confirmDeleteId = null"
    />

    <ConfirmModal
      :show="!!confirmStatusId"
      :title="confirmStatusAction === 'hide' ? t('comment.confirmHideTitle') : t('comment.confirmShowTitle')"
      :message="confirmStatusAction === 'hide' ? t('comment.confirmHideMessage') : t('comment.confirmShowMessage')"
      :confirm-text="confirmStatusAction === 'hide' ? t('comment.hide') : t('comment.show')"
      :is-danger="confirmStatusAction === 'hide'"
      @confirm="confirmStatusChange"
      @close="confirmStatusId = null; confirmStatusAction = ''"
    />
  </div>

  <!-- Loading State -->
  <div v-else class="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 space-y-4">
    <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    <p class="font-medium">Loading article...</p>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
