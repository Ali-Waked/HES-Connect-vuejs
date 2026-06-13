import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as tagService from '@/services/tagService'

export function useTags() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const tags = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchTags(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await tagService.getTags(params)
      tags.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load tags'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => {
    fetchTags(_lastParams)
    fetchTagStats()
  })

  async function fetchTagStats() {
    statsLoading.value = true
    try {
      const { data } = await tagService.getTagStats()
      stats.value = data
    } catch {
      stats.value = null
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchTag(uuid) {
    const { data } = await tagService.getTag(uuid)
    return data.data;
  }

  async function createTag(formData) {
    saving.value = true
    try {
      await tagService.createTag(formData)
      store.addToast(t('tags.created') || 'Tag created successfully', 'success')
      await fetchTags(_lastParams)
      await fetchTagStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create tag'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateTag(uuid, formData) {
    saving.value = true
    try {
      await tagService.updateTag(uuid, formData)
      store.addToast(t('tags.updated') || 'Tag updated successfully', 'success')
      await fetchTags(_lastParams)
      await fetchTagStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update tag'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteTag(uuid) {
    try {
      await tagService.deleteTag(uuid)
      store.addToast('Tag deleted successfully', 'success')
      if (tags.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchTags(_lastParams)
      await fetchTagStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete tag'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    tags,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    fetchTags,
    fetchTagStats,
    fetchTag,
    createTag,
    updateTag,
    deleteTag,
  }
}
