import axiosClient from '@/axiosClient'

export function getStaff(params = {}) {
  return axiosClient.get('/dashboard/staff', { params })
}

export function deleteStaff(id) {
  return axiosClient.delete(`/dashboard/staff/${id}`)
}
