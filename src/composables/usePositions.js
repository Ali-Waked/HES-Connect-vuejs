import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as positionService from '@/services/positionService'

export function usePositions() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const positions = ref([])
  const pagination = ref({})
  const lookup = ref([])
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchPositions(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await positionService.getPositions(params)
      positions.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load positions'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => {
    fetchPositions(_lastParams)
    fetchPositionStats()
    fetchPositionsLookup()
  })

  async function fetchPositionStats() {
    statsLoading.value = true
    try {
      const { data } = await positionService.getPositionStats()
      stats.value = data.data || data
    } catch {
      stats.value = null
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchPositionsLookup() {
    try {
      const { data } = await positionService.getPositionsLookup()
      lookup.value = data.data || data
    } catch {
      lookup.value = []
    }
  }

  async function fetchPosition(uuid) {
    const { data } = await positionService.getPosition(uuid)
    return data.data
  }

  async function createPosition(formData) {
    saving.value = true
    try {
      await positionService.createPosition(formData)
      store.addToast(t('positions.created') || 'Position created successfully', 'success')
      await fetchPositions(_lastParams)
      await fetchPositionStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create position'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function updatePosition(uuid, formData) {
    saving.value = true
    try {
      await positionService.updatePosition(uuid, formData)
      store.addToast(t('positions.updated') || 'Position updated successfully', 'success')
      await fetchPositions(_lastParams)
      await fetchPositionStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update position'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function deletePosition(uuid) {
    try {
      await positionService.deletePosition(uuid)
      store.addToast(t('positions.deleted') || 'Position deleted successfully', 'success')
      if (positions.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchPositions(_lastParams)
      await fetchPositionStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete position'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    positions,
    loading,
    error,
    saving,
    pagination,
    lookup,
    stats,
    statsLoading,
    fetchPositions,
    fetchPositionStats,
    fetchPositionsLookup,
    fetchPosition,
    createPosition,
    updatePosition,
    deletePosition,
  }
}
