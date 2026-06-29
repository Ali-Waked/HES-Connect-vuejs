import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as searchHistoryService from '@/services/searchHistoryService'

export function useSearchHistory() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const trendingLoading = ref(false)
  const saving = ref(false)
  const recentSearches = ref([])
  const trendingSearches = ref([])

  async function fetchRecent(params = {}) {
    loading.value = true
    try {
      const { data } = await searchHistoryService.getSearchHistories({ per_page: 10, ...params })
      recentSearches.value = data.data || data
    } catch {
      recentSearches.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchTrending(params = {}) {
    trendingLoading.value = true
    try {
      const { data } = await searchHistoryService.getTrendingSearches({ per_page: 10, ...params })
      trendingSearches.value = data.data || data
    } catch {
      trendingSearches.value = []
    } finally {
      trendingLoading.value = false
    }
  }

  async function logSearch(query, type = null) {
    if (!query.trim()) return
    saving.value = true
    try {
      await searchHistoryService.createSearchHistory({ query: query.trim(), type })
    } catch {
    } finally {
      saving.value = false
    }
  }

  async function clearHistory() {
    saving.value = true
    try {
      await searchHistoryService.clearAllSearchHistories()
      recentSearches.value = []
      store.addToast(t('searchHistory.cleared') || 'Search history cleared', 'success')
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear search history'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  useRefetchOnLanguageChange(() => {
    fetchRecent()
    fetchTrending()
  })

  return {
    recentSearches,
    trendingSearches,
    loading,
    trendingLoading,
    saving,
    fetchRecent,
    fetchTrending,
    logSearch,
    clearHistory,
  }
}
