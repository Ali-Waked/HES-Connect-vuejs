import axiosClient from '@/axiosClient'

export function getAuditLogs(params = {}) {
  return axiosClient.get('/dashboard/audit-logs', { params })
}
