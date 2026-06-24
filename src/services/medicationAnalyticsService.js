import axiosClient from '@/axiosClient'

export function getMedicationAnalytics(params = {}) {
  return axiosClient.get('/dashboard/medication-requests/analytics', { params })
}
