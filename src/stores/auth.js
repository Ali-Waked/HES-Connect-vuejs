import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axiosClient, { csrfCookie } from '@/axiosClient'
import { getInitials } from '../utils/locale'
import { useWorkspaceStore } from './workspace'

export const useAuthStore = defineStore('auth', () => {
  const user                        = ref(null)
  const loading                     = ref(false)
  const authenticated               = ref(false)
  const errors                      = ref({})
  const initCalled                  = ref(false)

  const systemPermissions           = ref([])
  const activeWorkspacePermissions  = ref([])
  const staffMemberships            = ref([])
  const activeWorkspace             = ref(null)

  function can(permission) {
    return systemPermissions.value.includes(permission) ||
           activeWorkspacePermissions.value.includes(permission)
  }

  function canAny(permissions) {
    return permissions.some(p => can(p))
  }

  function canAll(permissions) {
    return permissions.every(p => can(p))
  }

  const dashboardRoute = computed(() => {
    if (user.value?.dashboard_route) return user.value.dashboard_route
    if (staffMemberships.value.length > 0 && !activeWorkspace.value) return '/select-workspace'
    if (activeWorkspace.value) return '/dashboard'
    return '/'
  })

  function setActiveWorkspace(facilityId) {
    const found = staffMemberships.value.find(
      ws => ws.facility?.id === facilityId || ws.facility?.uuid === facilityId
    )
    if (found) {
      activeWorkspace.value = found
      activeWorkspacePermissions.value = found.permissions || []
      try { localStorage.setItem('hes_active_workspace_id', String(facilityId)) } catch {}
      const ws = useWorkspaceStore()
      ws.switchWorkspace(found)
    }
  }

  function loadStaffMemberships(memberships) {
    staffMemberships.value = memberships || []

    if (staffMemberships.value.length === 0) {
      activeWorkspace.value = null
      activeWorkspacePermissions.value = []
      return
    }

    const persistedId = (() => {
      try { return localStorage.getItem('hes_active_workspace_id') } catch { return null }
    })()

    if (persistedId) {
      const found = staffMemberships.value.find(
        ws => String(ws.facility?.id) === persistedId || String(ws.facility?.uuid) === persistedId
      )
      if (found) {
        activeWorkspace.value = found
        activeWorkspacePermissions.value = found.permissions || []
        return
      }
    }

    const first = staffMemberships.value[0]
    activeWorkspace.value = first
    activeWorkspacePermissions.value = first.permissions || []
    try { localStorage.setItem('hes_active_workspace_id', String(first.facility?.id || '')) } catch {}
  }

  async function fetchUser() {
    try {
      const { data } = await axiosClient.get('/profile')
      const userData = data.user || data

      user.value = {
        ...userData,
        avatar: userData.avatar || userData.profile_image || userData.image || '',
        initials: getInitials(typeof userData.name === 'string' ? userData.name : (userData.name?.en || userData.name?.ar || ''))
      }

      systemPermissions.value = userData.system_permissions || []
      loadStaffMemberships(userData.staff_memberships || [])

      if (userData.active_workspace_permissions) {
        activeWorkspacePermissions.value = userData.active_workspace_permissions
      }

      const ws = useWorkspaceStore()
      ws.loadWorkspaces(userData.staff_memberships || [])

      if (userData.dashboard_route) {
        user.value.dashboard_route = userData.dashboard_route
      }

      if (userData.locale) {
        const savedLang = localStorage.getItem('lang') || 'en'
        if (userData.locale !== savedLang) {
          localStorage.setItem('lang', userData.locale)
          const { locale } = useI18n()
          locale.value = userData.locale
          document.documentElement.setAttribute('dir', userData.locale === 'ar' ? 'rtl' : 'ltr')
          document.documentElement.setAttribute('lang', userData.locale)
        }
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
      } else if (err.response?.status === 419) {
        errors.value = { general: 'Session expired. Please refresh the page and try again.' }
      } else {
        errors.value = { general: err.response?.data?.message || 'Invalid credentials. Please try again.' }
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
      systemPermissions.value = []
      activeWorkspacePermissions.value = []
      staffMemberships.value = []
      activeWorkspace.value = null
      try { localStorage.removeItem('hes_active_workspace_id') } catch {}
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
    systemPermissions,
    activeWorkspacePermissions,
    staffMemberships,
    activeWorkspace,
    can,
    canAny,
    canAll,
    dashboardRoute,
    setActiveWorkspace,
    loadStaffMemberships,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    clearErrors,
    init,
  }
})
