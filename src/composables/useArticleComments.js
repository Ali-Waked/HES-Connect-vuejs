import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import * as commentService from '@/services/public/commentService'

export function useArticleComments(articleId) {
  const { t } = useI18n()
  const authStore = useAuthStore()

  const comments = ref([])
  const loading = ref(true)
  const commentText = ref('')
  const submitting = ref(false)
  const submitError = ref('')
  const commentCount = ref(0)

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.user)

  async function fetchComments() {
    loading.value = true
    try {
      const { data } = await commentService.getArticleComments(articleId)
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
      created_at: new Date().toISOString(),
    }
    comments.value.unshift(optimistic)
    commentCount.value++
    commentText.value = ''

    try {
      const { data } = await commentService.createComment(articleId, { content: text })
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

  return {
    comments,
    loading,
    commentText,
    submitting,
    submitError,
    commentCount,
    isAuthenticated,
    currentUser,
    fetchComments,
    submitComment,
  }
}
