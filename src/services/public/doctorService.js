import axiosClient from '@/axiosClient'

export function getDoctors(params = {}) {
  return axiosClient.get('/doctors', { params })
}

export function getDoctorDetail(uuid) {
  return axiosClient.get(`/doctors/${uuid}`)
}
