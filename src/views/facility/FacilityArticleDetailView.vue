<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStaffStore } from '@/stores/useStaffStore'
import { useArticleComments } from '@/composables/useArticleComments'
import * as dashboardCommentService from '@/services/dashboard/commentService'
import CommentTable from '@/components/dashboard/Articles/CommentTable.vue'
import ConfirmModal from '@/components/dashboard/global/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useStaffStore()

const articleUuid = computed(() => route.params.uuid)
const article = computed(() => {
  const list = store.articles || store.news || []
  return list.find(a => a.uuid === articleUuid.value || String(a.id) === articleUuid.value)
})

const {
  comments,
  loading,
  fetchComments,
  deleteComment,
  updateCommentStatus,
} = useArticleComments(articleUuid, { service: dashboardCommentService })

const confirmDeleteId = ref(null)
const confirmStatusId = ref(null)
const confirmStatusAction = ref('')

onMounted(() => {
  fetchComments()
})

function goBack() {
  router.push('/dashboard/articles')
}

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
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
      <button @click="goBack" class="hover:text-brand-primary transition cursor-pointer">{{ t('articles.title') }}</button>
      <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-slate-900 dark:text-white truncate max-w-[200px]">{{ article?.title || t('articleDetail.articleContent') }}</span>
    </nav>

    <div v-if="article" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="p-8 space-y-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ article.title }}</h1>
        <div class="prose prose-sm max-w-none dark:text-slate-300" v-html="article.content || article.excerpt || ''"></div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-16">
      <div class="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
      <p class="mt-4 text-sm text-slate-500 font-medium">{{ t('common.loading') }}</p>
    </div>

    <div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ t('comment.title') }}</h2>
      <CommentTable
        :comments="comments"
        :loading="loading"
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
</template>
