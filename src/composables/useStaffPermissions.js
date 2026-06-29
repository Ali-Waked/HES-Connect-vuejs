import { ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import * as staffPermissionService from '@/services/staffPermissionService'
import * as permissionService from '@/services/permissionService'

export function useStaffPermissions() {
  const store = useDashboardStore()

  const loading = ref(false)
  const updating = ref(null)
  const error = ref(null)
  const permissions = ref([])

  async function fetchPermissions(staffUuid) {
    loading.value = true
    error.value = null
    permissions.value = []

    try {
      const [allPermsRes, staffPermsRes] = await Promise.all([
        permissionService.getPermissions({ per_page: 1000 }),
        staffPermissionService.getStaffPermissions(staffUuid),
      ])

      const allPermissions = allPermsRes.data?.data || []
      const staffPermissions = staffPermsRes.data?.data || []

      const staffPermMap = {}
      staffPermissions.forEach((sp) => {
        staffPermMap[sp.permission_uuid || sp.uuid] = sp.enabled ?? true
      })

      permissions.value = allPermissions.map((p) => ({
        ...p,
        enabled: staffPermMap[p.uuid] ?? false,
      }))
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load permissions'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  async function togglePermission(staffUuid, permission, newState) {
    updating.value = permission.uuid
    const prevState = permission.enabled
    permission.enabled = newState

    try {
      await staffPermissionService.updateStaffPermission(staffUuid, permission.uuid, {
        enabled: newState,
      })
      store.addToast(
        `Permission "${permission.name?.en || permission.key || permission.uuid}" ${newState ? 'enabled' : 'disabled'}`,
        'success',
      )
    } catch (err) {
      permission.enabled = prevState
      const msg = err.response?.data?.message || 'Failed to update permission'
      store.addToast(msg, 'error')
    } finally {
      updating.value = null
    }
  }

  return {
    loading,
    updating,
    error,
    permissions,
    fetchPermissions,
    togglePermission,
  }
}
