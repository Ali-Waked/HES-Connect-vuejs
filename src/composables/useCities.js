import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as cityService from '@/services/cityService'

export function useCities() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const cities = ref([])
  const pagination = ref({})

  let _lastParams = {}

  async function fetchCities(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await cityService.getCities(params)
      cities.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load cities'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchCities(_lastParams))

  async function fetchCity(uuid) {
    const { data } = await cityService.getCity(uuid)
    return data.data
  }

  async function createCity(formData) {
    saving.value = true
    try {
      await cityService.createCity(formData)
      store.addToast(t('cities.created') || 'City created successfully', 'success')
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create city'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function updateCity(uuid, formData) {
    saving.value = true
    try {
      await cityService.updateCity(uuid, formData)
      store.addToast(t('cities.updated') || 'City updated successfully', 'success')
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update city'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function deleteCity(uuid) {
    try {
      await cityService.deleteCity(uuid)
      store.addToast('City deleted successfully', 'success')
      if (cities.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchCities(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete city'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    cities,
    loading,
    error,
    saving,
    pagination,
    fetchCities,
    fetchCity,
    createCity,
    updateCity,
    deleteCity,
  }
}
