import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useRoleGuard() {
  const route = useRoute()
  const authStore = useAuthStore()

  const role = computed(() => {
    if (authStore.systemPermissions?.length > 0) return 'super-admin'
    if (authStore.staffMemberships?.length > 0) return 'facility-owner'
    return 'user'
  })

  const canAccessPlatform = computed(() => authStore.systemPermissions?.length > 0)

  const canAccessFacility = computed(() => authStore.staffMemberships?.length > 0)

  function requireRole(allowedRoles) {
    return allowedRoles.includes(role.value)
  }

  function blockRoute(targetRole, fallback = '/') {
    if (targetRole === 'platform' && !canAccessPlatform.value) {
      return fallback
    }
    if (targetRole === 'dashboard' && canAccessPlatform.value && !canAccessFacility.value) {
      return fallback
    }
    return null
  }

  return {
    role,
    canAccessPlatform,
    canAccessFacility,
    requireRole,
    blockRoute,
  }
}
