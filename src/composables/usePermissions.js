import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as permissionService from '@/services/permissionService'

export function usePermissions() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const permissions = ref([])
  const pagination = ref({})
  const stats = ref(null)

  let _lastParams = {}

  async function fetchPermissions(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await permissionService.getPermissions(params)
      permissions.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load permissions'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchPermissions(_lastParams))

  async function fetchAllPermissions() {
    try {
      const { data } = await permissionService.getPermissions({ per_page: 1000, page: 1 })
      permissions.value = data.data
      return data.data
    } catch (err) {
      return []
    }
  }

  async function fetchPermissionStats() {
    try {
      const { data } = await permissionService.getPermissionStats()
      stats.value = data.data
    } catch (err) {
      // silently fail for stats
    }
  }

  async function fetchPermission(id) {
    const { data } = await permissionService.getPermission(id)
    return data.data
  }

  async function createPermission(formData) {
    saving.value = true
    try {
      await permissionService.createPermission(formData)
      store.addToast(t('access.permission_created') || 'Permission created successfully', 'success')
      await fetchPermissions(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create permission'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function updatePermission(id, formData) {
    saving.value = true
    try {
      await permissionService.updatePermission(id, formData)
      store.addToast(t('access.permission_updated') || 'Permission updated successfully', 'success')
      await fetchPermissions(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update permission'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function deletePermission(id) {
    try {
      await permissionService.deletePermission(id)
      store.addToast(t('access.permission_deleted') || 'Permission deleted successfully', 'success')
      if (permissions.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchPermissions(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete permission'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  return {
    permissions,
    loading,
    saving,
    error,
    pagination,
    stats,
    fetchPermissions,
    fetchAllPermissions,
    fetchPermissionStats,
    fetchPermission,
    createPermission,
    updatePermission,
    deletePermission,
  }
}
