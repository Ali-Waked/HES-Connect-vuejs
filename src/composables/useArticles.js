import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as articleService from '@/services/articleService'

export function useArticles() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const articles = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchArticles(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await articleService.getArticles(params)
      articles.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load articles'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchArticles(_lastParams))

  async function fetchArticleStats() {
    statsLoading.value = true
    try {
      const { data } = await articleService.getArticleStats()
      stats.value = data
    } catch (err) {
      // silently fail for stats
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchArticle(uuid) {
    const { data } = await articleService.getArticle(uuid)
    console.log(data);
    return data.data
  }

  async function createArticle(formData) {
    saving.value = true
    try {
      await articleService.createArticle(formData)
      store.addToast(t('articles.created') || 'Article created successfully', 'success')
      await fetchArticles(_lastParams)
      await fetchArticleStats()
      return { success: true }
    } catch (err) {
      console.log(err, err.response?.data)
      const msg = err.response?.data?.message || 'Failed to create article'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateArticle(uuid, formData) {
    saving.value = true
    try {
      await articleService.updateArticle(uuid, formData)
      store.addToast(t('articles.updated') || 'Article updated successfully', 'success')
      await fetchArticles(_lastParams)
      await fetchArticleStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update article'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteArticle(uuid) {
    try {
      await articleService.deleteArticle(uuid)
      store.addToast('Article deleted successfully', 'success')
      if (articles.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchArticles(_lastParams)
      await fetchArticleStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete article'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    articles,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    fetchArticles,
    fetchArticleStats,
    fetchArticle,
    createArticle,
    updateArticle,
    deleteArticle,
  }
}
