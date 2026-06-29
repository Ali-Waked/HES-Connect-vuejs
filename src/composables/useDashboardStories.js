import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as dashboardStoriesService from '@/services/dashboardStoriesService'

export function useDashboardStories() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const stories = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)
  const saving = ref(false)

  const trashLoading = ref(false)
  const trashError = ref(null)
  const trashedStories = ref([])
  const trashPagination = ref({})

  let _lastParams = {}
  let _lastTrashParams = {}

  async function fetchStories(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await dashboardStoriesService.getStories(params)
      stories.value = data?.data ?? []
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load stories'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchStories(_lastParams))

  async function fetchTrashStories(params = {}) {
    trashLoading.value = true
    trashError.value = null
    _lastTrashParams = params
    try {
      const { data } = await dashboardStoriesService.getTrashStories(params)
      trashedStories.value = data?.data ?? []
      trashPagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load trashed stories'
      trashError.value = msg
      store.addToast(msg, 'error')
    } finally {
      trashLoading.value = false
    }
  }

  async function fetchStoryStats() {
    statsLoading.value = true
    try {
      const { data } = await dashboardStoriesService.getStoryStats()
      const d = data?.data ?? data
      stats.value = {
        total: d.total_stories ?? d.total ?? 0,
        pending: d.pending_stories ?? d.pending ?? 0,
        approved: d.approved_stories ?? d.approved ?? 0,
        rejected: d.rejected_stories ?? d.rejected ?? 0,
        trashed_stories: d.trashed_stories ?? 0,
      }
    } catch (err) {
      // silently fail for stats
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchStory(id) {
    const { data } = await dashboardStoriesService.getStory(id)
    return data.data
  }

  async function updateStoryStatus(id, status) {
    saving.value = true
    try {
      await dashboardStoriesService.updateStoryStatus(id, status)
      const key = status === 'approved' ? 'stories.approved' : status === 'rejected' ? 'stories.rejected' : null
      store.addToast(key ? t(key) : `Story ${status} successfully`, 'success')
      await fetchStories(_lastParams)
      await fetchStoryStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${status} story`
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteStory(id) {
    try {
      await dashboardStoriesService.deleteStory(id)
      store.addToast(t('stories.deleted') || 'Story moved to trash', 'success')
      if (stories.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchStories(_lastParams)
      await fetchStoryStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete story'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  async function restoreStory(id) {
    saving.value = true
    try {
      await dashboardStoriesService.restoreStory(id)
      store.addToast(t('stories.restored') || 'Story restored successfully', 'success')
      await fetchTrashStories(_lastTrashParams)
      await fetchStoryStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to restore story'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function forceDeleteStory(id) {
    saving.value = true
    try {
      await dashboardStoriesService.forceDeleteStory(id)
      store.addToast(t('stories.forceDeleted') || 'Story permanently deleted', 'success')
      if (trashedStories.value.length <= 1 && (_lastTrashParams.page || 1) > 1) {
        _lastTrashParams = { ..._lastTrashParams, page: (_lastTrashParams.page || 1) - 1 }
      }
      await fetchTrashStories(_lastTrashParams)
      await fetchStoryStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to permanently delete story'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  return {
    stories,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    trashedStories,
    trashLoading,
    trashError,
    trashPagination,
    fetchStories,
    fetchTrashStories,
    fetchStoryStats,
    fetchStory,
    updateStoryStatus,
    deleteStory,
    restoreStory,
    forceDeleteStory,
  }
}
