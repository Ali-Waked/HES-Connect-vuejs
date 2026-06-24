import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'

export function useAuthPermissions() {
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()

  function can(permission) {
    return authStore.can(permission)
  }

  function canAny(permissions) {
    return authStore.canAny(permissions)
  }

  function canAll(permissions) {
    return authStore.canAll(permissions)
  }

  function hasRole(role) {
    return authStore.userRoles.includes(role)
  }

  function hasSystemRole(role) {
    return authStore.hasSystemRole(role)
  }

  function hasFacilityRole(role) {
    return authStore.hasFacilityRole(role)
  }

  function hasAnyRole(...roles) {
    return authStore.hasAnyRole(...roles)
  }

  function isSuperAdmin() {
    return authStore.isSuperAdmin()
  }

  function isModerator() {
    return authStore.isModerator()
  }

  function isAdmin() {
    return authStore.isAdmin()
  }

  function isDoctor() {
    return workspaceStore.currentRoleSlug === 'doctor'
  }

  function isNurse() {
    return workspaceStore.currentRoleSlug === 'nurse'
  }

  function isPharmacist() {
    return workspaceStore.currentRoleSlug === 'pharmacist'
  }

  function isReceptionist() {
    return workspaceStore.currentRoleSlug === 'receptionist'
  }

  function isFacilityManager() {
    return workspaceStore.currentRoleSlug === 'facility-manager'
  }

  const currentRoleSlug = computed(() => workspaceStore.currentRoleSlug)
  const currentPermissions = computed(() => workspaceStore.currentPermissions)

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasSystemRole,
    hasFacilityRole,
    hasAnyRole,
    isSuperAdmin,
    isModerator,
    isAdmin,
    isDoctor,
    isNurse,
    isPharmacist,
    isReceptionist,
    isFacilityManager,
    currentRoleSlug,
    currentPermissions,
  }
}
