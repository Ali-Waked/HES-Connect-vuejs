import axiosClient from '@/axiosClient'

export function getUserStats() {
  return axiosClient.get('/dashboard/users/stats')
}
