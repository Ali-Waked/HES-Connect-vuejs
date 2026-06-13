import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as facilityService from '@/services/facilityService'

export function useFacilities() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const facilities = ref([])
  const pagination = ref({})
  const stats = ref(null)

  let _lastParams = {}

  async function fetchFacilities(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await facilityService.getFacilities(params)
      facilities.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load facilities'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchFacilities(_lastParams))

  async function fetchAllFacilities() {
    try {
      const { data } = await facilityService.getFacilities({ per_page: 1000, page: 1 })
      facilities.value = data.data
    } catch (err) {
      // silently fail for dropdowns
    }
  }

  async function fetchFacilityStats() {
    try {
      const { data } = await facilityService.getFacilityStats()
      stats.value = data
    } catch (err) {
      // silently fail for stats
    }
  }

  async function fetchFacility(uuid) {
    const { data } = await facilityService.getFacility(uuid)
    return data.data
  }

  async function createFacility(formData) {
    saving.value = true
    try {
      await facilityService.createFacility(formData)
      store.addToast(t('facilities.created') || 'Facility created successfully', 'success')
      await fetchFacilities(_lastParams)
      await fetchFacilityStats()
      return { success: true }
    } catch (err) {
      console.log(err,err.response?.data);
      const msg = err.response?.data?.message || 'Failed to create facility'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateFacility(uuid, formData) {
    saving.value = true
    try {
      await facilityService.updateFacility(uuid, formData)
      store.addToast(t('facilities.updated') || 'Facility updated successfully', 'success')
      await fetchFacilities(_lastParams)
      await fetchFacilityStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update facility'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteFacility(uuid) {
    try {
      await facilityService.deleteFacility(uuid)
      store.addToast('Facility deleted successfully', 'success')
      if (facilities.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchFacilities(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete facility'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    facilities,
    loading,
    error,
    saving,
    pagination,
    stats,
    fetchFacilities,
    fetchAllFacilities,
    fetchFacilityStats,
    fetchFacility,
    createFacility,
    updateFacility,
    deleteFacility,
  }
}
