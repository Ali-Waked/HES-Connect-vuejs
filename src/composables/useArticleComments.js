import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import * as publicService from '@/services/public/commentService'

export function useArticleComments(articleId, options = {}) {
  const { t } = useI18n()
  const authStore = useAuthStore()

  const service = options.service || publicService

  const comments = ref([])
  const loading = ref(true)
  const commentText = ref('')
  const submitting = ref(false)
  const submitError = ref('')
  const commentCount = ref(0)

  const editingCommentId = ref(null)
  const editText = ref('')
  const editing = ref(false)

  const isAuthenticated = computed(() => authStore.authenticated)
  const currentUser = computed(() => authStore.user)

  function userOwnsComment(comment) {
    if (!currentUser.value) return false
    return comment.user_id === currentUser.value.id ||
           comment.user_uuid === currentUser.value.uuid ||
           (comment.is_owner === true)
  }

  async function fetchComments() {
    loading.value = true
    try {
      const { data } = await service.getArticleComments(articleId)
      const list = data?.data || data || []
      comments.value = Array.isArray(list) ? list : []
      commentCount.value = comments.value.length
    } catch {
      comments.value = []
    } finally {
      loading.value = false
    }
  }

  async function submitComment() {
    const text = commentText.value.trim()
    if (!text) {
      submitError.value = t('common.required')
      return
    }
    if (text.length < 3) {
      submitError.value = 'Comment must be at least 3 characters.'
      return
    }
    submitError.value = ''
    submitting.value = true

    const optimistic = {
      id: `temp-${Date.now()}`,
      content: text,
      user_name: currentUser.value?.name || 'You',
      user_avatar: currentUser.value?.avatar || null,
      user_id: currentUser.value?.id,
      created_at: new Date().toISOString(),
      is_owner: true,
    }
    comments.value.unshift(optimistic)
    commentCount.value++
    commentText.value = ''

    try {
      const { data } = await service.createComment(articleId, { content: text })
      const saved = data?.data || data
      if (saved) {
        const idx = comments.value.findIndex((c) => c.id === optimistic.id)
        if (idx !== -1) comments.value[idx] = saved
      }
    } catch (err) {
      const idx = comments.value.findIndex((c) => c.id === optimistic.id)
      if (idx !== -1) comments.value.splice(idx, 1)
      commentCount.value--
      submitError.value = err.response?.data?.message || t('contactPage.errorGeneric')
    } finally {
      submitting.value = false
    }
  }

  function startEdit(comment) {
    editingCommentId.value = comment.id
    editText.value = comment.content
    editing.value = true
  }

  function cancelEdit() {
    editingCommentId.value = null
    editText.value = ''
    editing.value = false
  }

  async function saveEdit() {
    const text = editText.value.trim()
    if (!text || text.length < 3) return
    const commentId = editingCommentId.value
    if (!commentId) return

    const idx = comments.value.findIndex((c) => c.id === commentId)
    if (idx === -1) return

    const original = { ...comments.value[idx] }
    comments.value[idx] = { ...comments.value[idx], content: text }
    cancelEdit()

    try {
      const { data } = await service.updateComment(articleId, commentId, { content: text })
      const saved = data?.data || data
      if (saved && idx !== -1) {
        comments.value[idx] = saved
      }
    } catch {
      if (idx !== -1) comments.value[idx] = original
    }
  }

  async function deleteComment(commentId) {
    const idx = comments.value.findIndex((c) => c.id === commentId)
    if (idx === -1) return

    const original = comments.value[idx]
    comments.value.splice(idx, 1)
    commentCount.value--

    try {
      await service.deleteComment(articleId, commentId)
    } catch {
      comments.value.splice(idx, 0, original)
      commentCount.value++
    }
  }

  async function updateCommentStatus(commentId, status) {
    const idx = comments.value.findIndex((c) => c.id === commentId)
    if (idx === -1) return

    const original = { ...comments.value[idx] }
    comments.value[idx] = { ...comments.value[idx], status }

    try {
      await service.updateCommentStatus(articleId, commentId, status)
    } catch {
      if (idx !== -1) comments.value[idx] = original
    }
  }

  return {
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
    updateCommentStatus,
  }
}
