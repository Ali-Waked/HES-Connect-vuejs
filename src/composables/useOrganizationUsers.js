import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as orgUserService from '@/services/organizationUserService'

export function useOrganizationUsers() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const organizationUsers = ref([])
  const pagination = ref({})

  let _lastParams = {}

  async function fetchOrganizationUsers(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await orgUserService.getOrganizationUsers(params)
      organizationUsers.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load organization users'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchOrganizationUsers(_lastParams))

  async function fetchOrganizationUser(id) {
    const { data } = await orgUserService.getOrganizationUser(id)
    return data.data
  }

  async function createOrganizationUser(formData) {
    saving.value = true
    try {
      await orgUserService.createOrganizationUser(formData)
      store.addToast(t('organizationUsers.createdMessage') || 'Assignment created successfully', 'success')
      await fetchOrganizationUsers(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create assignment'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateOrganizationUser(id, formData) {
    saving.value = true
    try {
      await orgUserService.updateOrganizationUser(id, formData)
      store.addToast(t('organizationUsers.updatedMessage') || 'Assignment updated successfully', 'success')
      await fetchOrganizationUsers(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update assignment'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteOrganizationUser(id) {
    try {
      await orgUserService.deleteOrganizationUser(id)
      store.addToast(t('organizationUsers.deletedMessage') || 'Assignment deleted successfully', 'success')
      if (organizationUsers.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchOrganizationUsers(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete assignment'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    organizationUsers,
    loading,
    error,
    saving,
    pagination,
    fetchOrganizationUsers,
    fetchOrganizationUser,
    createOrganizationUser,
    updateOrganizationUser,
    deleteOrganizationUser,
  }
}
