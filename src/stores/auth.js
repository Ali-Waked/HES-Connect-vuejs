import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient, { csrfCookie } from '@/axiosClient'
import { getInitials } from '../utils/locale'
import { useWorkspaceStore } from './workspace'

export const useAuthStore = defineStore('auth', () => {
  const user                = ref(null)
  const loading             = ref(false)
  const authenticated       = ref(false)
  const errors              = ref({})
  const initCalled          = ref(false)

  const systemRoles         = ref([])
  const systemPermissions   = ref([])
  const staffMemberships    = ref([])

  const hasSystemRole = (role) => systemRoles.value.some(r => r.slug === role)
  const hasSystemPermission = (perm) => systemPermissions.value.some(p => typeof p === 'string' ? p === perm : p.key === perm)

  const isSuperAdmin = () => hasSystemRole('super_admin')
  const isModerator = () => hasSystemRole('moderator')
  const isAdmin = () => isSuperAdmin() || hasSystemRole('admin')

  function hasFacilityRole(role) {
    const ws = useWorkspaceStore()
    if (ws.currentWorkspace) return ws.currentRoleSlug === role
    return staffMemberships.value.some(m => m.role?.slug === role)
  }

  const hasAnyRole = (...roles) => roles.some(r => hasSystemRole(r) || hasFacilityRole(r))

  const userRoles = computed(() => {
    const roles = []
    for (const r of systemRoles.value) roles.push(r.slug)
    const ws = useWorkspaceStore()
    if (ws.currentRoleSlug) roles.push(ws.currentRoleSlug)
    for (const m of staffMemberships.value) {
      if (m.role?.slug && !roles.includes(m.role.slug)) roles.push(m.role.slug)
    }
    return roles
  })

  const dashboardRoute = computed(() => {
    if (isSuperAdmin() || isAdmin()) return '/platform/dashboard'
    if (isModerator()) return '/platform/dashboard'
    const ws = useWorkspaceStore()
    if (ws.currentWorkspace) return ws.resolveDashboardLanding()
    if (staffMemberships.value.length > 0) return '/dashboard'
    return '/'
  })

  function can(permission) {
    if (isSuperAdmin() || isAdmin()) return true
    if (hasSystemPermission(permission)) return true

    const ws = useWorkspaceStore()
    if (ws.currentWorkspace) {
      return ws.hasPermission(permission)
    }

    for (const m of staffMemberships.value) {
      const perms = m.permissions || []
      if (perms.includes('*') || perms.includes(permission)) return true
    }

    return false
  }

  function canAny(permissions) {
    return permissions.some(p => can(p))
  }

  function canAll(permissions) {
    return permissions.every(p => can(p))
  }

  async function fetchUser() {
    try {
      const { data } = await axiosClient.get('/profile')
      const userData = data.user || data
      user.value = {
        ...userData,
        initials: getInitials(typeof userData.name === 'string' ? userData.name : (userData.name?.en || userData.name?.ar || ''))
      }
      systemRoles.value = userData.system_roles || []
      systemPermissions.value = userData.system_permissions || []
      staffMemberships.value = userData.staff_memberships || []

      const ws = useWorkspaceStore()
      ws.loadWorkspaces(userData.staff_memberships || [])

      if (userData.dashboard_route) {
        user.value.dashboard_route = userData.dashboard_route
      }

      authenticated.value = true
    } catch {
      user.value = null
      authenticated.value = false
    }
  }

  async function login(credentials) {
    errors.value  = {}
    loading.value = true
    try {
      await csrfCookie()
      await axiosClient.post('/login', credentials)
      await fetchUser()
      return { success: true }
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors ?? {}
      } else if (err.response?.status === 429) {
        errors.value = { email: ['Too many attempts. Please wait and try again.'] }
      } else {
        errors.value = { general: 'Invalid credentials. Please try again.' }
      }
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function register(form) {
    errors.value  = {}
    loading.value = true
    try {
      await csrfCookie()
      await axiosClient.post('/register', form)
      await fetchUser()
      return { success: true }
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors ?? {}
      } else {
        errors.value = { general: 'Registration failed. Please try again.' }
      }
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await axiosClient.post('/logout')
    } finally {
      user.value = null
      authenticated.value = false
      systemRoles.value = []
      systemPermissions.value = []
      staffMemberships.value = []
      const ws = useWorkspaceStore()
      ws.clearWorkspaces()
    }
  }

  function updateProfile({ name }) {
    if (user.value) {
      user.value = {
        ...user.value,
        name,
        initials: getInitials(name)
      }
    }
  }

  function clearErrors() {
    errors.value = {}
  }

  async function init() {
    if (initCalled.value) return
    await fetchUser()
    initCalled.value = true
  }

  return {
    user,
    loading,
    authenticated,
    errors,
    initCalled,
    systemRoles,
    systemPermissions,
    staffMemberships,
    hasSystemRole,
    hasSystemPermission,
    hasFacilityRole,
    hasAnyRole,
    isSuperAdmin,
    isModerator,
    isAdmin,
    can,
    canAny,
    canAll,
    userRoles,
    dashboardRoute,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    clearErrors,
    init,
  }
})
