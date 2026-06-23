import axiosClient from '@/axiosClient'

export function getDashboard(params = {}) {
  return axiosClient.get('/facility/dashboard', { params })
}

export function getLiveAppointments(params = {}) {
  return axiosClient.get('/facility/dashboard/appointments/live', { params })
}

export function getDoctorsPerformance(params = {}) {
  return axiosClient.get('/facility/dashboard/doctors-performance', { params })
}

export function getPatientsOverview(params = {}) {
  return axiosClient.get('/facility/dashboard/patients', { params })
}

export function getSchedules(params = {}) {
  return axiosClient.get('/facility/dashboard/schedules', { params })
}

export function getAnalytics(params = {}) {
  return axiosClient.get('/facility/dashboard/analytics', { params })
}

export function getAlerts(params = {}) {
  return axiosClient.get('/facility/dashboard/alerts', { params })
}

export function getStaff(params = {}) {
  return axiosClient.get('/facility/staff', { params })
}
