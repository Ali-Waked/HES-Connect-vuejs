import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setWorkspaceIdProvider } from '@/axiosClient'

const STORAGE_KEY = 'hes_active_workspace_id'

setWorkspaceIdProvider(() => {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
})

const DASHBOARD_LANDING_RULES = [
  { permission: 'appointments.manage', route: '/dashboard/appointments' },
  { permission: 'appointments.view-all', route: '/dashboard/appointments' },
  { permission: 'appointments.view-own', route: '/dashboard/appointments' },
  { permission: 'appointments.view', route: '/dashboard/appointments' },
  { permission: 'patients.view', route: '/dashboard/patients' },
  { permission: 'patients.view-own', route: '/dashboard/patients' },
  { permission: 'staff.manage', route: '/dashboard/staff' },
  { permission: 'staff.view', route: '/dashboard/staff' },
  { permission: 'facility.analytics.view', route: '/dashboard/analytics' },
  { permission: 'prescriptions.view', route: '/dashboard/prescriptions' },
  { permission: 'prescriptions.view-own', route: '/dashboard/prescriptions' },
  { permission: 'inventory.view', route: '/dashboard/inventory' },
  { permission: 'medication_requests.view', route: '/dashboard/medication-requests' },
  { permission: 'reports.view', route: '/dashboard/reports' },
  { permission: 'departments.view', route: '/dashboard/departments' },
  { permission: 'reviews.view', route: '/dashboard/reviews' },
  { permission: 'medicines.view', route: '/dashboard/medicines' },
  { permission: 'articles.view', route: '/dashboard/articles' },
  { permission: 'documents.view', route: '/dashboard/documents' },
  { permission: 'job_posts.view', route: '/dashboard/job-posts' },
  { permission: 'messages.view', route: '/dashboard/messages' },
]

export const useWorkspaceStore = defineStore('workspace', () => {
  const availableWorkspaces = ref([])
  const currentWorkspace = ref(null)
  const loaded = ref(false)

  const currentWorkspaceId = computed(() => currentWorkspace.value?.workspace_id ?? null)

  const currentFacility = computed(() => currentWorkspace.value?.facility ?? null)

  const currentRole = computed(() => currentWorkspace.value?.role ?? null)

  const currentRoleSlug = computed(() => currentWorkspace.value?.role?.slug ?? null)

  const currentPermissions = computed(() => currentWorkspace.value?.permissions ?? [])

  const hasMultipleWorkspaces = computed(() => availableWorkspaces.value.length > 1)

  const hasWorkspaces = computed(() => availableWorkspaces.value.length > 0)

  function getPersistedWorkspaceId() {
    try {
      return Number(localStorage.getItem(STORAGE_KEY)) || null
    } catch {
      return null
    }
  }

  function persistWorkspace(id) {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, String(id))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // localStorage unavailable
    }
  }

  function loadWorkspaces(memberships) {
    availableWorkspaces.value = (memberships || []).filter(m => m?.facility && m?.role)

    if (availableWorkspaces.value.length === 0) {
      currentWorkspace.value = null
      persistWorkspace(null)
      loaded.value = true
      return
    }

    const persistedId = getPersistedWorkspaceId()

    if (persistedId) {
      const found = availableWorkspaces.value.find(w => w.workspace_id === persistedId)
      if (found) {
        currentWorkspace.value = found
        loaded.value = true
        return
      }
    }

    if (availableWorkspaces.value.length === 1) {
      currentWorkspace.value = availableWorkspaces.value[0]
      persistWorkspace(currentWorkspace.value.workspace_id)
    } else {
      currentWorkspace.value = null
    }

    loaded.value = true
  }

  function switchWorkspace(workspace) {
    if (!workspace || !availableWorkspaces.value.find(w => w.workspace_id === workspace.workspace_id)) return
    currentWorkspace.value = workspace
    persistWorkspace(workspace.workspace_id)
  }

  function switchWorkspaceById(workspaceId) {
    const workspace = availableWorkspaces.value.find(w => w.workspace_id === workspaceId)
    if (workspace) switchWorkspace(workspace)
  }

  function clearWorkspaces() {
    availableWorkspaces.value = []
    currentWorkspace.value = null
    persistWorkspace(null)
    loaded.value = false
  }

  function hasPermission(permission) {
    if (!currentWorkspace.value) return false
    const perms = currentPermissions.value
    if (perms.includes('*')) return true
    return perms.includes(permission)
  }

  function hasAnyPermission(...permissions) {
    return permissions.some(p => hasPermission(p))
  }

  function hasAllPermissions(...permissions) {
    return permissions.every(p => hasPermission(p))
  }

  function resolveDashboardLanding() {
    for (const rule of DASHBOARD_LANDING_RULES) {
      if (hasPermission(rule.permission)) return rule.route
    }
    return '/dashboard'
  }

  return {
    availableWorkspaces,
    currentWorkspace,
    currentWorkspaceId,
    currentFacility,
    currentRole,
    currentRoleSlug,
    currentPermissions,
    hasMultipleWorkspaces,
    hasWorkspaces,
    loaded,
    loadWorkspaces,
    switchWorkspace,
    switchWorkspaceById,
    clearWorkspaces,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    resolveDashboardLanding,
  }
})
