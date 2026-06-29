import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as symptomService from '@/services/symptomService'

export function useSymptoms() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const symptoms = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchSymptoms(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await symptomService.getSymptoms(params)
      symptoms.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load symptoms'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => {
    fetchSymptoms(_lastParams)
    fetchSymptomStats()
  })

  async function fetchSymptomStats() {
    statsLoading.value = true
    try {
      const { data } = await symptomService.getSymptomStats()
      stats.value = data
    } catch {
      stats.value = null
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchSymptom(uuid) {
    const { data } = await symptomService.getSymptom(uuid)
    return data.data
  }

  async function createSymptom(formData) {
    saving.value = true
    try {
      await symptomService.createSymptom(formData)
      store.addToast(t('symptoms.created') || 'Symptom created successfully', 'success')
      await fetchSymptoms(_lastParams)
      await fetchSymptomStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create symptom'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateSymptom(uuid, formData) {
    saving.value = true
    try {
      await symptomService.updateSymptom(uuid, formData)
      store.addToast(t('symptoms.updated') || 'Symptom updated successfully', 'success')
      await fetchSymptoms(_lastParams)
      await fetchSymptomStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update symptom'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteSymptom(uuid) {
    try {
      await symptomService.deleteSymptom(uuid)
      store.addToast(t('symptoms.deleted') || 'Symptom deleted successfully', 'success')
      if (symptoms.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchSymptoms(_lastParams)
      await fetchSymptomStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete symptom'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  async function toggleSymptomStatus(uuid, currentStatus) {
    return await updateSymptom(uuid, { is_active: !currentStatus })
  }

  return {
    symptoms,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    fetchSymptoms,
    fetchSymptomStats,
    fetchSymptom,
    createSymptom,
    updateSymptom,
    deleteSymptom,
    toggleSymptomStatus,
  }
}
