import axiosClient from '@/axiosClient'

export function getFacilities(params = {}) {
  return axiosClient.get('/facilities', { params })
}

export function getFacilityDetail(uuid) {
  return axiosClient.get(`/facilities/${uuid}`)
}
