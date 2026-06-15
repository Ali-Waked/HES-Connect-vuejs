import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as roleService from '@/services/roleService'

/**
 * @typedef {Object} RoleStats
 * @property {number} total_roles
 * @property {number} assigned_roles
 * @property {number} unassigned_roles
 * @property {number} total_permission_assignments
 */

export function useRoles() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const roles = ref([])
  const pagination = ref({})
  const stats = ref(null) // ✅ Fix 1: declare stats

  let _lastParams = {}

  async function fetchRoles(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await roleService.getRoles(params)
      roles.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load roles'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchRoles(_lastParams))

  async function fetchAllRoles() {
    try {
      const { data } = await roleService.getRoles({ per_page: 1000, page: 1 })
      roles.value = data.data
    } catch (err) {
      // silently fail for dropdowns
    }
  }

  async function fetchRole(id) {
    const { data } = await roleService.getRole(id)
    return data.data
  }

  // ✅ Fix 2: declare fetchRoleStats
  async function fetchRoleStats() {
    try {
      const { data } = await roleService.getRoleStats()
      stats.value = data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load role stats'
      store.addToast(msg, 'error')
    }
  }

  async function createRole(formData) {
    saving.value = true
    try {
      await roleService.createRole(formData)
      store.addToast(t('access.role_created') || 'Role created successfully', 'success')
      await fetchRoles(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create role'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function updateRole(id, formData) {
    saving.value = true
    try {
      await roleService.updateRole(id, formData)
      store.addToast(t('access.role_updated') || 'Role updated successfully', 'success')
      await fetchRoles(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update role'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function deleteRole(id) {
    try {
      await roleService.deleteRole(id)
      store.addToast(t('access.role_deleted') || 'Role deleted successfully', 'success')
      if (roles.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchRoles(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete role'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    roles,
    loading,
    saving,
    error,
    pagination,
    stats,           // ✅ now properly declared as ref(null)
    fetchRoles,
    fetchAllRoles,
    fetchRoleStats,  // ✅ now properly declared as an async function
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
  }
}