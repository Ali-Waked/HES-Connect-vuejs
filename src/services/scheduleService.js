import axiosClient from '@/axiosClient'

export function getSchedules(params = {}) {
  return axiosClient.get('/staff/schedules', { params })
}

export function getCalendarEvents(params = {}) {
  return axiosClient.get('/dashboard/schedules/calendar', { params })
}

export function createSchedule(data) {
  return axiosClient.post('/staff/schedules', data)
}

export function updateSchedule(id, data) {
  return axiosClient.put(`/staff/schedules/${id}`, data)
}

export function deleteSchedule(id) {
  return axiosClient.delete(`/staff/schedules/${id}`)
}

export function getUnavailability(staffUuid, params = {}) {
  return axiosClient.get(`/staff/${staffUuid}/unavailability`, { params })
}

export function createUnavailability(staffUuid, data) {
  return axiosClient.post(`/staff/${staffUuid}/unavailability`, data)
}

export function deleteUnavailability(staffUuid, id) {
  return axiosClient.delete(`/staff/${staffUuid}/unavailability/${id}`)
}
