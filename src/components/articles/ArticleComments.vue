<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArticleComments } from '../../composables/useArticleComments'
import CommentForm from './CommentForm.vue'
import CommentCard from './CommentCard.vue'

const props = defineProps({
  articleId: { type: [String, Number], required: true },
})

const { t } = useI18n()

const {
  comments,
  loading,
  commentText,
  submitting,
  submitError,
  commentCount,
  isAuthenticated,
  currentUser,
  editingCommentId,
  editText,
  editing,
  fetchComments,
  submitComment,
  userOwnsComment,
  startEdit,
  cancelEdit,
  saveEdit,
  deleteComment,
} = useArticleComments(props.articleId)

onMounted(fetchComments)

function handleDelete(commentId) {
  deleteComment(commentId)
}
</script>

<template>
  <div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
      {{ t('comment.title') }}
      <span class="text-sm font-normal text-slate-400 dark:text-slate-500">({{ commentCount }})</span>
    </h3>
    <div class="card-base p-6 space-y-6">
      <CommentForm
        v-model="commentText"
        :submitting="submitting"
        :submit-error="submitError"
        @submit="submitComment"
      />

      <div v-if="loading && comments.length === 0" class="space-y-4">
        <div v-for="n in 3" :key="n" class="flex gap-3 animate-pulse">
          <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      <div v-else-if="comments.length === 0" class="text-center py-10">
        <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.97 5.97 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
        </svg>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('comment.noComments') }}</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ t('comment.beFirst') }}</p>
      </div>

      <div v-else class="space-y-4">
        <CommentCard
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :is-owner="userOwnsComment(comment)"
          :editing="editingCommentId === comment.id"
          :edit-text="editingCommentId === comment.id ? editText : ''"
          @edit="startEdit(comment)"
          @cancel-edit="cancelEdit"
          @save-edit="saveEdit"
          @delete="handleDelete(comment.id)"
          @update:edit-text="editText = $event"
        />
      </div>
    </div>
  </div>
</template>
