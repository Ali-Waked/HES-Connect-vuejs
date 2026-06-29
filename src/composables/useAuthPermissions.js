import { useAuthStore } from '@/stores/auth'

export function useAuthPermissions() {
  const authStore = useAuthStore()

  function can(permission) {
    return authStore.can(permission)
  }

  function canAny(permissions) {
    return authStore.canAny(permissions)
  }

  function canAll(permissions) {
    return authStore.canAll(permissions)
  }

  return {
    can,
    canAny,
    canAll,
  }
}
