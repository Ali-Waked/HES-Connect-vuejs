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

export function getSchedules(params = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facilities/${facilityUuid}/schedules`, { params })
}

export function getCalendarEvents(params = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/facilities/${facilityUuid}/schedules`, { params })
}

export function createSchedule(data) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.post(`/facilities/${facilityUuid}/schedules`, data)
}

export function updateSchedule(id, data) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.put(`/facilities/${facilityUuid}/schedules/${id}`, data)
}

export function deleteSchedule(id) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.delete(`/facilities/${facilityUuid}/schedules/${id}`)
}

export function getUnavailability(facilityUuid, params = {}) {
  return axiosClient.get(`/facilities/${facilityUuid}/unavailabilities`, { params })
}

export function createUnavailability(facilityUuid, data) {
  return axiosClient.post(`/facilities/${facilityUuid}/unavailabilities`, data)
}

export function deleteUnavailability(facilityUuid, id) {
  return axiosClient.delete(`/facilities/${facilityUuid}/unavailabilities/${id}`)
}
