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

function facilityPath(base = '') {
  const uuid = getFacilityUuid()
  if (!uuid) return `/dashboard/appointments${base}`
  return `/dashboard/facility/${uuid}/appointments${base}`
}

export function getAppointments(params = {}) {
  return axiosClient.get(facilityPath(), { params })
}

export function getAppointment(uuid) {
  return axiosClient.get(`/dashboard/appointments/${uuid}`)
}

export function updateAppointment(uuid, data = {}) {
  return axiosClient.put(`/dashboard/appointments/${uuid}`, data)
}

export function deleteAppointment(uuid) {
  return axiosClient.delete(`/dashboard/appointments/${uuid}`)
}

export function getAppointmentStats(params = {}) {
  return axiosClient.get(facilityPath('/stats'), { params })
}

export function getAppointmentCalendar(params = {}) {
  return axiosClient.get(facilityPath('/calendar'), { params })
}

export function getAppointmentAnalytics(params = {}) {
  return axiosClient.get(facilityPath('/analytics'), { params })
}

export function cancelAppointment(uuid, data = {}) {
  return axiosClient.post(`/dashboard/appointments/${uuid}/cancel`, data)
}

export function rescheduleAppointment(uuid, data = {}) {
  return axiosClient.post(`/dashboard/appointments/${uuid}/reschedule`, data)
}

export function restoreAppointment(uuid) {
  return axiosClient.post(`/dashboard/appointments/${uuid}/restore`)
}

export function forceCompleteAppointment(uuid) {
  return axiosClient.post(`/dashboard/appointments/${uuid}/force-complete`)
}

export function createAppointment(data) {
  return axiosClient.post('/appointments', data)
}

export function getMyAppointments(params = {}) {
  return axiosClient.get('/appointments', { params })
}

export function cancelMyAppointment(uuid, data = {}) {
  return axiosClient.post(`/appointments/${uuid}/cancel`, data)
}

export function getLiveAppointments(params = {}) {
  const uuid = getFacilityUuid()
  if (!uuid) return Promise.resolve({ data: { data: [] } })
  return axiosClient.get(`/facility/dashboard/appointments/live`, { params })
}

export function exportAppointments(params = {}) {
  return axiosClient.get(facilityPath('/export'), { params, responseType: 'blob' })
}

export function getFacilityStaff(params = {}) {
  const uuid = getFacilityUuid()
  if (!uuid) return Promise.resolve({ data: { data: [] } })
  return axiosClient.get(`/facility/${uuid}/staff`, { params })
}
