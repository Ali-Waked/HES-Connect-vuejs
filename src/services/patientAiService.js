import axiosClient from '@/axiosClient'

export function sendConsultationMessage(data) {
  return axiosClient.post('/patient/ai/consultation', data)
}
