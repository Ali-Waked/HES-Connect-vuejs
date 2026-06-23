import axiosClient from '@/axiosClient'

export function getMedicationAnalytics(params = {}) {
  return axiosClient.get('/admin/dashboard/medication-analytics', { params })
}
