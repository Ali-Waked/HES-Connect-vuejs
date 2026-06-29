import axiosClient from '@/axiosClient'
import { useWorkspaceStore } from '@/stores/workspace'

function getFacilityUuid() {
  try {
    const store = useWorkspaceStore()
    return store.currentFacility?.uuid
  } catch {
    return null
  }
}

export function getStaffPermissions(staffUuid) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facility/${facilityUuid}/staff/${staffUuid}/permissions`)
}

export function updateStaffPermission(staffUuid, permissionUuid, data) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.patch(`/facility/${facilityUuid}/staff/${staffUuid}/permissions/${permissionUuid}`, data)
}
