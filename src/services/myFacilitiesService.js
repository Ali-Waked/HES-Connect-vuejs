import axiosClient from '@/axiosClient'

export function getMyFacilities() {
  return axiosClient.get('/my/facilities')
}
