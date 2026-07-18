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

export function getUnavailabilityRequests(params = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facility/${facilityUuid}/staff-unavailabilities`, { params })
}

export function getUnavailabilityRequest(uuid) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facility/${facilityUuid}/staff-unavailabilities/${uuid}`)
}

export function approveUnavailabilityRequest(uuid, data = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.patch(`/facility/${facilityUuid}/staff-unavailabilities/${uuid}/approve`, data)
}

export function rejectUnavailabilityRequest(uuid, data = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.patch(`/facility/${facilityUuid}/staff-unavailabilities/${uuid}/reject`, data)
}
