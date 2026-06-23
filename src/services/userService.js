import axiosClient from '@/axiosClient'

export function getUserStats() {
  return axiosClient.get('/dashboard/users/stats')
}

export function getUserSelect(role) {
  const params = {}
  if (role) params.role = role
  return axiosClient.get('/dashboard/users/select', { params })
}
