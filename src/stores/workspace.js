import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useWorkspaceStore = defineStore('workspace', () => {
  const availableWorkspaces = ref([])
  const currentWorkspace = ref(null)
  const loaded = ref(false)

  const currentWorkspaceId = computed(() => currentWorkspace.value?.workspace_id ?? currentWorkspace.value?.facility?.id ?? null)
  const currentFacility = computed(() => currentWorkspace.value?.facility ?? null)
  const currentRole = computed(() => currentWorkspace.value?.role ?? null)
  const currentRoleSlug = computed(() => currentWorkspace.value?.role?.slug ?? null)
  const hasMultipleWorkspaces = computed(() => availableWorkspaces.value.length > 1)
  const hasWorkspaces = computed(() => availableWorkspaces.value.length > 0)

  function loadWorkspaces(memberships) {
    availableWorkspaces.value = (memberships || []).filter(m => m?.facility && m?.role)

    if (availableWorkspaces.value.length === 0) {
      currentWorkspace.value = null
      loaded.value = true
      return
    }

    const authStore = useAuthStore()
    if (authStore.activeWorkspace) {
      const found = availableWorkspaces.value.find(
        w => w.workspace_id === authStore.activeWorkspace.workspace_id ||
             w.facility?.id === authStore.activeWorkspace.facility?.id
      )
      if (found) {
        currentWorkspace.value = found
        loaded.value = true
        return
      }
    }

    if (availableWorkspaces.value.length === 1) {
      currentWorkspace.value = availableWorkspaces.value[0]
    } else {
      currentWorkspace.value = null
    }

    loaded.value = true
  }

  function switchWorkspace(workspace) {
    if (!workspace || !availableWorkspaces.value.find(w =>
      w.workspace_id === workspace.workspace_id || w.facility?.id === workspace.facility?.id
    )) return
    currentWorkspace.value = workspace
  }

  function switchWorkspaceById(workspaceId) {
    const workspace = availableWorkspaces.value.find(
      w => w.workspace_id === workspaceId || w.facility?.id === workspaceId
    )
    if (workspace) switchWorkspace(workspace)
  }

  function clearWorkspaces() {
    availableWorkspaces.value = []
    currentWorkspace.value = null
    loaded.value = false
  }

  return {
    availableWorkspaces,
    currentWorkspace,
    currentWorkspaceId,
    currentFacility,
    currentRole,
    currentRoleSlug,
    hasMultipleWorkspaces,
    hasWorkspaces,
    loaded,
    loadWorkspaces,
    switchWorkspace,
    switchWorkspaceById,
    clearWorkspaces,
  }
})
