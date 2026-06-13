import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as orgService from '@/services/organizationService'

export function useOrganizations() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)

  const organizations = computed(() => store.organizations.value)

  const pagination = ref({})

  let _lastParams = {}

  async function fetchOrganizations(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await orgService.getOrganizations(params)
      store.organizations.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load organizations'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchOrganizations(_lastParams))

  async function fetchAllOrganizations() {
    try {
      const { data } = await orgService.getOrganizations({ per_page: 1000, page: 1 })
      store.organizations.value = data.data
    } catch (err) {
      // silently fail for dropdowns
    }
  }

  async function fetchOrganization(uuid) {
    console.log('1 uuid',uuid)
    const { data } = await orgService.getOrganization(uuid)
    return data.data
  }

  async function createOrganization(formData) {
    saving.value = true
    try {
      await orgService.createOrganization(formData)
      store.addToast(t('organizations.created') || 'Organization created successfully', 'success')
      await fetchOrganizations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create organization'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateOrganization(id, formData) {
    saving.value = true
    try {
      await orgService.updateOrganization(id, formData)
      store.addToast(t('organizations.updated') || 'Organization updated successfully', 'success')
      await fetchOrganizations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update organization'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteOrganization(id) {
    try {
      await orgService.deleteOrganization(id)
      store.addToast('Organization deleted successfully', 'success')
      if (store.organizations.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchOrganizations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete organization'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    organizations,
    loading,
    error,
    saving,
    pagination,
    fetchOrganizations,
    fetchAllOrganizations,
    fetchOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  }
}
