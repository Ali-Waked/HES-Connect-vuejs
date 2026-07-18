import axiosClient from '@/axiosClient'

export function getDashboard(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard`, { params })
}

export function getLiveAppointments(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard/appointments/live`, { params })
}

export function getDoctorsPerformance(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard/doctors-performance`, { params })
}

export function getPatientsOverview(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard/patients`, { params })
}

export function getSchedules(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard/schedules`, { params })
}

export function getAnalytics(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard/analytics`, { params })
}

export function getAlerts(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard/alerts`, { params })
}

export function getStaff(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/staff`, { params })
}
