import { useAuthStore } from '@/stores/auth'

export const guards = {
  beforeEnter: {
    platformOnly() {
      const auth = useAuthStore()
      if (auth.systemPermissions.length === 0) return { name: 'unauthorized' }
      return true
    },

    facilityOnly() {
      const auth = useAuthStore()
      if (auth.systemPermissions.length > 0) return { name: 'unauthorized' }
      if (auth.staffMemberships.length === 0) return { name: 'unauthorized' }
      return true
    },

    hasPermission(permission) {
      return () => {
        const auth = useAuthStore()
        if (!auth.can(permission)) return { name: 'unauthorized' }
        return true
      }
    },
  },

  isPlatformRoute() {
    const auth = useAuthStore()
    return auth.systemPermissions.length > 0
  },

  isFacilityRoute() {
    const auth = useAuthStore()
    return auth.staffMemberships.length > 0
  },
}
