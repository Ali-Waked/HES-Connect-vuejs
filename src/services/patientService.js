import axiosClient from '@/axiosClient'

export function getPatients(params = {}) {
  return axiosClient.get('/dashboard/patients', { params })
}

export function deletePatient(id) {
  return axiosClient.delete(`/dashboard/patients/${id}`)
}
