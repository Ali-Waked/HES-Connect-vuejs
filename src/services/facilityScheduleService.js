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

export function getStaffSchedules(params = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facility/${facilityUuid}/staff-schedules`, { params })
}

export function getStaffSchedule(scheduleUuid) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facility/${facilityUuid}/staff-schedules/${scheduleUuid}`)
}

export function createStaffSchedule(data) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.post(`/facility/${facilityUuid}/staff-schedules`, data)
}

export function updateStaffSchedule(scheduleUuid, data) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.put(`/facility/${facilityUuid}/staff-schedules/${scheduleUuid}`, data)
}

export function deleteStaffSchedule(scheduleUuid) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.delete(`/facility/${facilityUuid}/staff-schedules/${scheduleUuid}`)
}

export function getStaffLookup() {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facility/${facilityUuid}/staff-lookup`)
}
