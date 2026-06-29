import axiosClient from '@/axiosClient'

export function sendChatMessage(data) {
  return axiosClient.post('/dashboard/ai/chat', data)
}
